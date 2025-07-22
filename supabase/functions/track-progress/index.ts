import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface TrackProgressRequest {
  userId: string;
  missionId: string;
  roomType: 'clarity' | 'quiz' | 'memory' | 'test';
  performance: {
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    difficulty: string;
    xpGained: number;
  };
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

    if (req.method === 'POST') {
      const { userId, missionId, roomType, performance }: TrackProgressRequest = await req.json()

      // Calculate XP and achievements
      const xpCalculation = calculateXP(performance, roomType)
      
      // Update user progress
      const { data: userProgress, error: progressError } = await supabaseClient
        .from('user_progress')
        .upsert({
          user_id: userId,
          mission_id: missionId,
          room_type: roomType,
          correct_answers: performance.correctAnswers,
          total_questions: performance.totalQuestions,
          time_spent: performance.timeSpent,
          difficulty: performance.difficulty,
          xp_gained: xpCalculation.xpGained,
          completed_at: new Date().toISOString(),
        })
        .select()

      if (progressError) {
        throw progressError
      }

      // Update user XP
      const { data: userXP, error: xpError } = await supabaseClient
        .rpc('update_user_xp', {
          user_id: userId,
          xp_to_add: xpCalculation.xpGained
        })

      if (xpError) {
        throw xpError
      }

      // Check for achievements
      const achievements = await checkAchievements(supabaseClient, userId, performance, roomType)

      return new Response(
        JSON.stringify({
          success: true,
          xpGained: xpCalculation.xpGained,
          totalXP: userXP,
          achievements,
          progress: userProgress[0]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const userId = url.searchParams.get('userId')

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Get user progress summary
      const { data: userStats, error } = await supabaseClient
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return new Response(
        JSON.stringify({
          success: true,
          stats: userStats || {
            user_id: userId,
            total_xp: 0,
            current_level: 1,
            missions_completed: 0,
            streak_days: 0
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error tracking progress:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to track progress' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function calculateXP(performance: any, roomType: string): { xpGained: number; bonusXP: number } {
  const baseXP = {
    clarity: 5,
    quiz: 10,
    memory: 8,
    test: 20
  }

  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2
  }

  const accuracyBonus = performance.correctAnswers / performance.totalQuestions
  const speedBonus = performance.timeSpent < 300 ? 1.2 : 1

  const xpGained = Math.round(
    baseXP[roomType as keyof typeof baseXP] * 
    performance.correctAnswers * 
    difficultyMultiplier[performance.difficulty as keyof typeof difficultyMultiplier] * 
    speedBonus
  )

  const bonusXP = Math.round(xpGained * accuracyBonus * 0.5)

  return { xpGained: xpGained + bonusXP, bonusXP }
}

async function checkAchievements(supabaseClient: any, userId: string, performance: any, roomType: string) {
  const achievements = []

  // Perfect score achievement
  if (performance.correctAnswers === performance.totalQuestions) {
    achievements.push({
      id: 'perfect_score',
      title: 'Perfect Score!',
      description: 'Got 100% in a room',
      icon: '🎯'
    })
  }

  // Speed demon achievement
  if (performance.timeSpent < 120) {
    achievements.push({
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Completed in under 2 minutes',
      icon: '⚡'
    })
  }

  // Save achievements to database
  for (const achievement of achievements) {
    await supabaseClient
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievement.id,
        earned_at: new Date().toISOString()
      })
  }

  return achievements
}