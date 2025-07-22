import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const webhookType = url.pathname.split('/').pop()

    switch (webhookType) {
      case 'youtube-metadata':
        return await handleYouTubeMetadata(req, supabaseClient)
      
      case 'payment-success':
        return await handlePaymentSuccess(req, supabaseClient)
      
      case 'user-milestone':
        return await handleUserMilestone(req, supabaseClient)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown webhook type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleYouTubeMetadata(req: Request, supabaseClient: any) {
  const { videoId, metadata } = await req.json()
  
  // Store YouTube video metadata for better content analysis
  const { error } = await supabaseClient
    .from('youtube_metadata')
    .upsert({
      video_id: videoId,
      title: metadata.title,
      description: metadata.description,
      duration: metadata.duration,
      thumbnail: metadata.thumbnail,
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw error
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handlePaymentSuccess(req: Request, supabaseClient: any) {
  const { userId, subscriptionType, amount } = await req.json()
  
  // Update user subscription status
  const { error } = await supabaseClient
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      subscription_type: subscriptionType,
      amount,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    })

  if (error) {
    throw error
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUserMilestone(req: Request, supabaseClient: any) {
  const { userId, milestone, data } = await req.json()
  
  // Log user milestone for analytics
  const { error } = await supabaseClient
    .from('user_milestones')
    .insert({
      user_id: userId,
      milestone_type: milestone,
      milestone_data: data,
      achieved_at: new Date().toISOString()
    })

  if (error) {
    throw error
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}