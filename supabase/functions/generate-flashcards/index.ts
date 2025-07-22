import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GenerateFlashcardsRequest {
  missionId: string;
  content: any;
  cardCount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { missionId, content, cardCount = 10 }: GenerateFlashcardsRequest = await req.json()

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
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
            content: `You are Twizzle, creating memory flashcards for Indian students. Generate ${cardCount} flashcards that help memorize key concepts. Format as JSON:
            {
              "flashcards": [
                {
                  "id": "card1",
                  "front": "Question or term",
                  "back": "Answer or definition",
                  "category": "Category name",
                  "difficulty": "easy|medium|hard",
                  "hint": "Optional hint"
                }
              ],
              "totalCards": ${cardCount},
              "categories": ["cat1", "cat2"]
            }`
          },
          {
            role: 'user',
            content: `Create ${cardCount} flashcards based on: ${JSON.stringify(content)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const flashcardData = JSON.parse(aiResponse.choices[0].message.content)

    return new Response(
      JSON.stringify({
        success: true,
        flashcards: flashcardData,
        missionId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating flashcards:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate flashcards' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})