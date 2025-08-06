import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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
  estimated_time?: number;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface MissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  room_type: 'clarity' | 'quiz' | 'memory' | 'test';
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  max_score: number;
  time_spent: number;
  attempts: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: 'learning' | 'speed' | 'streak' | 'social' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  criteria: any;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  total_required: number;
  unlocked: boolean;
  unlocked_at?: string;
  created_at: string;
  achievements?: Achievement;
}

export class SupabaseService {
  // Authentication
  static async signUp(email: string, password: string, fullName?: string) {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.')
    }
    
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

    // Create profile using Edge Function to bypass RLS
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
          console.error('Error creating profile via Edge Function:', profileError)
          throw profileError
        }

        if (!profileData?.success) {
          throw new Error(profileData?.error || 'Failed to create user profile')
        }
      } catch (profileError) {
        console.error('Profile creation failed:', profileError)
        // Don't throw here to allow user to continue, they can complete profile later
      }
    }

    return data
  }

  static async signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.')
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  static async signOut() {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.')
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser() {
    if (!supabase) {
      return null
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Handle the case where there's no auth session - this is normal for unauthenticated users
    if (error && error.message === 'Auth session missing!') {
      return null
    }
    
    if (error) throw error
    return user
  }

  // Profile Management
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          return await this.createProfileForExistingUser(userId)
        }
        
        return null
      }

      // If no profile exists, create one
      if (!data) {
        return await this.createProfileForExistingUser(userId)
      }

      return data
    } catch (error) {
      console.error('Error in getProfile:', error)
      return null
    }
  }

  // Create profile for existing authenticated user
  static async createProfileForExistingUser(userId: string): Promise<UserProfile | null> {
    try {
      // Get user email from auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== userId) {
        throw new Error('User not authenticated')
      }

      const { data: profileData, error: profileError } = await supabase.functions.invoke('create-user-profile', {
        body: {
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name
        }
      })

      if (profileError) {
        console.error('Error creating profile for existing user:', profileError)
        return null
      }

      if (!profileData?.success) {
        console.error('Profile creation failed:', profileData?.error)
        return null
      }

      return profileData.profile
    } catch (error) {
      console.error('Failed to create profile for existing user:', error)
      return null
    }
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // User Stats
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user stats:', error)
        
        // If stats don't exist, create them
        if (error.code === 'PGRST116') {
          return await this.initializeUserStats(userId)
        }
        
        return null
      }

      // If no stats exist for this user, create initial stats
      if (!data) {
        return await this.initializeUserStats(userId)
      }

      return data
    } catch (error) {
      console.error('Error in getUserStats:', error)
      return null
    }
  }

  // Initialize user stats for new users
  static async initializeUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          total_xp: 0,
          current_level: 1,
          missions_completed: 0,
          streak_days: 0,
          last_activity_date: new Date().toISOString().split('T')[0], // Today's date
          rank: 'Beginner',
          total_study_time: 0,
        })
        .select()
        .single()

      if (error) {
        console.error('Error initializing user stats:', error)
        
        // If there's a conflict (stats already exist), try to fetch them
        if (error.code === '23505') {
          const { data: existingStats } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single()
          
          return existingStats || null
        }
        
        return null
      }

      return data
    } catch (error) {
      console.error('Failed to initialize user stats:', error)
      return null
    }
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
      .select(`
        *,
        subjects(name, icon, color),
        mission_progress(room_type, status, score, max_score)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching missions:', error)
      return []
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

  // Progress Tracking - Fixed implementation
  static async updateProgress(progressData: {
    mission_id: string;
    room_type: 'clarity' | 'quiz' | 'memory' | 'test';
    score: number;
    max_score: number;
    time_spent: number;
    completed: boolean;
  }) {
    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('User not authenticated')
      }

      // Call the edge function with proper authorization
      const { data, error } = await supabase.functions.invoke('update-progress', {
        body: progressData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        console.error('Edge function error:', error)
        throw error
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update progress')
      }

      return data
    } catch (error) {
      console.error('Error in updateProgress:', error)
      throw error
    }
  }

  static async getMissionProgress(userId: string, missionId: string): Promise<MissionProgress[]> {
    const { data, error } = await supabase
      .from('mission_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)

    if (error) {
      console.error('Error fetching mission progress:', error)
      return []
    }

    return data || []
  }

  // Achievements
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (error) {
      console.error('Error fetching achievements:', error)
      return []
    }

    return data || []
  }

  static async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching achievements:', error)
      return []
    }

    return data || []
  }

  // Dashboard Data
  static async getDashboardData(userId: string) {
    const { data, error } = await supabase.functions.invoke('get-user-dashboard')

    if (error) throw error
    return data
  }

  // Subjects
  static async getSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching subjects:', error)
      return []
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

  // Helper method to ensure user has complete profile and stats
  static async ensureUserDataExists(userId: string): Promise<{ profile: UserProfile | null; stats: UserStats | null }> {
    try {
      const [profile, stats] = await Promise.all([
        this.getProfile(userId),
        this.getUserStats(userId)
      ])

      return { profile, stats }
    } catch (error) {
      console.error('Error ensuring user data exists:', error)
      return { profile: null, stats: null }
    }
  }
}