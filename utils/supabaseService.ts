import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  missions_completed: number;
  streak_days: number;
  last_activity_date: string;
  rank: string;
  total_study_time: number;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject_id?: string;
  content_type: 'youtube' | 'pdf' | 'text' | 'camera';
  content_url?: string;
  content_text?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: number;
  xp_reward: number;
  status: 'active' | 'archived' | 'draft';
  is_public: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  required_value: number;
  xp_reward: number;
  badge_color: string;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface UserMemory {
  id: string;
  user_id: string;
  topic: string;
  subject: string;
  proficiency_score: number;
  last_interacted: string;
  weak_areas: string[];
  strong_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface DailyQuiz {
  id: string;
  date: string;
  questions: QuizQuestion[];
  total_points: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  subject: string;
  subtopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  source?: string;
}

export class SupabaseService {
  // Authentication
  static async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    // Create profile using Edge Function
    if (data.user) {
      try {
        const { data: profileData, error: profileError } = await supabase.functions.invoke('create-user-profile', {
          body: {
            userId: data.user.id,
            email,
            fullName
          }
        })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      } catch (profileError) {
        console.error('Profile creation failed:', profileError)
      }
    }

    return data
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error && error.message !== 'Auth session missing!') throw error
    return user
  }

  // Profile Management
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      throw error
    }

    return data
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // User Stats
  static async getUserStats(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }

    return data
  }

  // Subjects and Topics
  static async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching subjects:', error)
      throw error
    }

    return data || []
  }

  // Daily Quiz
  static async getTodayQuiz(): Promise<DailyQuiz | null> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_quizzes')
      .select('*')
      .eq('date', today)
      .maybeSingle()

    if (error) {
      console.error('Error fetching daily quiz:', error)
      throw error
    }

    return data
  }

  static async generateDailyQuiz(): Promise<DailyQuiz> {
    const { data, error } = await supabase.functions.invoke('generate-daily-quiz')

    if (error) throw error
    return data
  }

  // Subject Quizzes
  static async getSubjectQuiz(subject: string, subtopic?: string): Promise<QuizQuestion[]> {
    const { data, error } = await supabase.functions.invoke('generate-subject-quiz', {
      body: { subject, subtopic }
    })

    if (error) throw error
    return data.questions || []
  }

  // User Memory & Personalization
  static async getUserMemory(userId: string): Promise<UserMemory[]> {
    const { data, error } = await supabase
      .from('user_memory')
      .select('*')
      .eq('user_id', userId)
      .order('last_interacted', { ascending: false })

    if (error) {
      console.error('Error fetching user memory:', error)
      throw error
    }

    return data || []
  }

  static async updateUserMemory(userId: string, topic: string, subject: string, score: number) {
    const { data, error } = await supabase
      .from('user_memory')
      .upsert({
        user_id: userId,
        topic,
        subject,
        proficiency_score: score,
        last_interacted: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,topic'
      })

    if (error) throw error
    return data
  }

  // Mascot Recommendations
  static async getMascotRecommendations(userId: string): Promise<string[]> {
    const { data, error } = await supabase.functions.invoke('get-mascot-recommendations', {
      body: { userId }
    })

    if (error) throw error
    return data.recommendations || []
  }

  // Progress Tracking
  static async updateQuizProgress(userId: string, quizData: {
    quiz_type: 'daily' | 'subject';
    subject?: string;
    subtopic?: string;
    score: number;
    total_questions: number;
    time_spent: number;
  }) {
    const { data, error } = await supabase.functions.invoke('update-quiz-progress', {
      body: { userId, ...quizData }
    })

    if (error) throw error
    return data
  }

  // Achievements
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements:achievement_id (
          name,
          description,
          icon,
          badge_color
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching achievements:', error)
      throw error
    }

    return data || []
  }

  static async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching achievements:', error)
      throw error
    }

    return data || []
  }

  // Leaderboard
  static async getLeaderboard(timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly') {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .order('total_xp', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      throw error
    }

    return data || []
  }

  // Analytics for marketing
  static async trackUserActivity(userId: string, activity: string, metadata?: any) {
    try {
      // Update last activity date
      await supabase
        .from('user_stats')
        .update({ 
          last_activity_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      // Log activity for analytics
      console.log(`User ${userId} performed: ${activity}`, metadata)
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }

  // App Stats for marketing
  static async getAppStats() {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: activeUsers } = await supabase
        .from('user_stats')
        .select('*', { count: 'exact', head: true })
        .gte('last_activity_date', sevenDaysAgo.toISOString().split('T')[0])

      // Get total quizzes taken
      const { count: totalQuizzes } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalQuizzes: totalQuizzes || 0,
      }
    } catch (error) {
      console.error('Error fetching app stats:', error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalQuizzes: 0,
      }
    }
  }
}