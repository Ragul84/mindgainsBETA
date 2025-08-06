import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const today = new Date().toISOString().split('T')[0]

    // Check if today's quiz already exists
    const { data: existingQuiz } = await supabaseClient
      .from('daily_quizzes')
      .select('*')
      .eq('date', today)
      .single()

    if (existingQuiz) {
      return new Response(
        JSON.stringify(existingQuiz),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate new daily quiz using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const subjects = ['History', 'Polity', 'Geography', 'Economy', 'Science & Technology', 'Current Affairs']
    const selectedSubjects = subjects.sort(() => 0.5 - Math.random()).slice(0, 3) // Random 3 subjects

    const prompt = `Generate 10 multiple choice questions for Indian students covering these subjects: ${selectedSubjects.join(', ')}.

Focus on:
- Indian history (ancient, medieval, modern)
- Indian constitution and governance
- Indian geography and economy
- Current affairs relevant to India
- Science & technology developments in India

Each question should:
- Be factually accurate and India-focused
- Have 4 options with only 1 correct answer
- Include a clear explanation
- Be appropriate for competitive exam preparation
- Cover different difficulty levels (4 easy, 4 medium, 2 hard)

Return JSON format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation",
      "subject": "Subject name",
      "subtopic": "Specific subtopic",
      "difficulty": "easy|medium|hard",
      "points": 10
    }
  ]
}`

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
            content: 'You are an expert in Indian education and competitive exams. Generate high-quality quiz questions for Indian students.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const quizData = JSON.parse(aiResponse.choices[0].message.content)

    // Store daily quiz
    const { data: dailyQuiz, error } = await supabaseClient
      .from('daily_quizzes')
      .insert({
        date: today,
        questions: quizData.questions,
        total_points: quizData.questions.reduce((sum: number, q: any) => sum + q.points, 0)
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify(dailyQuiz),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating daily quiz:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate daily quiz' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})