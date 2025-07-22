import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GenerateQuizRequest {
  missionId: string;
  content: any;
  difficulty?: string;
  questionCount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { missionId, content, difficulty = 'intermediate', questionCount = 5 }: GenerateQuizRequest = await req.json()

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
            content: `You are Twizzle, creating engaging quiz questions for Indian students. Generate ${questionCount} multiple choice questions based on the content. Format as JSON:
            {
              "questions": [
                {
                  "id": "q1",
                  "question": "Question text",
                  "options": ["A", "B", "C", "D"],
                  "correctAnswer": 0,
                  "explanation": "Why this is correct",
                  "difficulty": "easy|medium|hard",
                  "points": 10
                }
              ],
              "totalPoints": 50,
              "timeLimit": 300
            }`
          },
          {
            role: 'user',
            content: `Create ${questionCount} ${difficulty} level quiz questions based on: ${JSON.stringify(content)}`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const quizData = JSON.parse(aiResponse.choices[0].message.content)

    return new Response(
      JSON.stringify({
        success: true,
        quiz: quizData,
        missionId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating quiz:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate quiz' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})