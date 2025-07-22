import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GenerateTestRequest {
  missionId: string;
  content: any;
  testType?: string;
  questionCount?: number;
  timeLimit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      missionId, 
      content, 
      testType = 'comprehensive', 
      questionCount = 15, 
      timeLimit = 900 
    }: GenerateTestRequest = await req.json()

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
            content: `You are Twizzle, creating comprehensive tests for Indian students. Generate ${questionCount} test questions of varying difficulty. Format as JSON:
            {
              "test": {
                "title": "Test title",
                "instructions": "Test instructions",
                "timeLimit": ${timeLimit},
                "totalPoints": 100,
                "questions": [
                  {
                    "id": "t1",
                    "type": "mcq|short|long",
                    "question": "Question text",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswer": 0,
                    "points": 5,
                    "explanation": "Detailed explanation",
                    "difficulty": "easy|medium|hard"
                  }
                ]
              },
              "passingScore": 60
            }`
          },
          {
            role: 'user',
            content: `Create a ${testType} test with ${questionCount} questions based on: ${JSON.stringify(content)}`
          }
        ],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const testData = JSON.parse(aiResponse.choices[0].message.content)

    return new Response(
      JSON.stringify({
        success: true,
        test: testData,
        missionId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating test:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate test' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})