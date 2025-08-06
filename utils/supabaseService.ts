import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UserProfile {
  id: string;
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

export interface MissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  current_room: 'clarity' | 'quiz' | 'memory' | 'test';
  clarity_completed: boolean;
  quiz_completed: boolean;
  memory_completed: boolean;
  test_completed: boolean;
  completion_percentage: number;
  xp_earned: number;
  time_spent: number;
  started_at: string;
  completed_at?: string;
  last_accessed: string;
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

  // Missions
  static async createMission(missionData: {
    title: string;
    description?: string;
    content_type: 'youtube' | 'pdf' | 'text' | 'camera';
    content_url?: string;
    content_text?: string;
    subject_name?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    contentType?: string;
    examFocus?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('create-mission', {
      body: missionData,
    })

    if (error) throw error
    return data
  }

  static async getUserMissions(userId: string, limit = 10): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching missions:', error)
      throw error
    }

    return data || []
  }

  static async getMissionContent(missionId: string, roomType?: string) {
    const { data, error } = await supabase.functions.invoke('get-mission-content', {
      body: { mission_id: missionId, room_type: roomType },
    })

    if (error) throw error
    return data
  }

  // Progress Tracking
  static async updateProgress(progressData: {
    mission_id: string;
    room_type: 'clarity' | 'quiz' | 'memory' | 'test';
    score: number;
    max_score: number;
    time_spent: number;
    completed: boolean;
  }) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase.functions.invoke('update-progress', {
      body: progressData,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (error) throw error
    return data
  }

  static async getMissionProgress(userId: string, missionId: string): Promise<MissionProgress | null> {
    const { data, error } = await supabase
      .from('mission_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching mission progress:', error)
      throw error
    }

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

  // Subjects
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

  // Real-time subscriptions
  static subscribeToUserStats(userId: string, callback: (stats: UserStats) => void) {
    return supabase
      .channel('user_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as UserStats)
        }
      )
      .subscribe()
  }

  static subscribeToMissionProgress(
    userId: string,
    missionId: string,
    callback: (progress: MissionProgress) => void
  ) {
    return supabase
      .channel('mission_progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mission_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).mission_id === missionId) {
            callback(payload.new as MissionProgress)
          }
        }
      )
      .subscribe()
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

  // Marketing features
  static async getAppStats() {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get total missions
      const { count: totalMissions } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true })

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: activeUsers } = await supabase
        .from('user_stats')
        .select('*', { count: 'exact', head: true })
        .gte('last_activity_date', sevenDaysAgo.toISOString().split('T')[0])

      return {
        totalUsers: totalUsers || 0,
        totalMissions: totalMissions || 0,
        activeUsers: activeUsers || 0,
      }
    } catch (error) {
      console.error('Error fetching app stats:', error)
      return {
        totalUsers: 0,
        totalMissions: 0,
        activeUsers: 0,
      }
    }
  }
}