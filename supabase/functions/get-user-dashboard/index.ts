import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get user stats
    const { data: stats } = await supabaseClient
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get recent missions
    const { data: recentMissions } = await supabaseClient
      .from('missions')
      .select(`
        *,
        subjects(name, icon, color),
        mission_progress(room_type, status, score, max_score)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5)

    // Get user achievements
    const { data: userAchievements } = await supabaseClient
      .from('user_achievements')
      .select(`
        *,
        achievements(title, description, icon, category, rarity, xp_reward)
      `)
      .eq('user_id', user.id)
      .eq('unlocked', true)
      .order('unlocked_at', { ascending: false })
      .limit(10)

    // Get achievement progress
    const { data: achievementProgress } = await supabaseClient
      .from('user_achievements')
      .select(`
        *,
        achievements(title, description, icon, category, rarity, xp_reward)
      `)
      .eq('user_id', user.id)
      .eq('unlocked', false)
      .limit(5)

    // Calculate additional stats
    const totalMissions = recentMissions?.length || 0
    const completedMissions = recentMissions?.filter(m => 
      m.mission_progress?.every((p: any) => p.status === 'completed')
    ).length || 0

    const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          ...profile
        },
        stats: {
          ...stats,
          completion_rate: completionRate,
          total_missions: totalMissions,
          completed_missions: completedMissions
        },
        recent_missions: recentMissions,
        achievements: userAchievements,
        achievement_progress: achievementProgress
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error getting user dashboard:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to get user dashboard' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})