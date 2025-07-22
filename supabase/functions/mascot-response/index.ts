import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface MascotResponseRequest {
  context: string;
  userAction: string;
  performance?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { context, userAction, performance }: MascotResponseRequest = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      // Return fallback response if API key not available
      return new Response(
        JSON.stringify({
          success: true,
          response: {
            message: "Keep going! You're doing great! 🌟",
            mood: "encouraging",
            animation: "bounce"
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Twizzle, a friendly AI mascot for Indian students. You're encouraging, motivational, and use Indian context when appropriate. Keep responses short (1-2 sentences), engaging, and age-appropriate. Use emojis sparingly. Format as JSON:
            {
              "message": "Your encouraging message",
              "mood": "happy|excited|encouraging|celebrating|concerned",
              "animation": "bounce|cheer|think|celebrate|comfort"
            }`
          },
          {
            role: 'user',
            content: `Context: ${context}. User action: ${userAction}. Performance: ${JSON.stringify(performance)}`
          }
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const mascotResponse = JSON.parse(aiResponse.choices[0].message.content)

    return new Response(
      JSON.stringify({
        success: true,
        response: mascotResponse,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating mascot response:', error)
    // Return fallback response on error
    return new Response(
      JSON.stringify({
        success: true,
        response: {
          message: "Keep going! You're doing amazing! 🌟",
          mood: "encouraging",
          animation: "bounce"
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})