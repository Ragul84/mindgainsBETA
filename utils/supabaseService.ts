import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'
import { 
  demoUserProfile, 
  demoUserStats, 
  demoMissions, 
  demoSubjects, 
  demoAchievements, 
  demoUserAchievements,
  demoAppStats 
} from './demoData';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Some features may not work.')
  // Create a mock client for development
  const mockClient = {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
      upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    }),
    functions: {
      invoke: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
  }
  
  // Export mock client
  export const supabase = mockClient as any
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export interface UserProfile {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
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
  title: string;
  description: string;
  icon?: string;
  category: 'learning' | 'speed' | 'streak' | 'social' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  criteria?: any;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement_title?: string;
  achievement_description?: string;
  achievement_icon?: string;
  earned_at: string;
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
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return demoUserProfile;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      return demoUserProfile // Fallback to demo data
    }

    return data || demoUserProfile
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return { ...demoUserProfile, ...updates };
    }
    
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
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return demoUserStats;
    }
    
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user stats:', error)
      return demoUserStats // Fallback to demo data
    }

    return data || demoUserStats
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
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      const demoMission = {
        id: `demo_${Date.now()}`,
        user_id: 'demo-user',
        title: missionData.title,
        description: missionData.description,
        subject_id: null,
        content_type: missionData.content_type,
        content_url: missionData.content_url,
        content_text: missionData.content_text,
        difficulty: missionData.difficulty || 'medium',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return {
        success: true,
        mission: demoMission,
        message: 'Demo mission created successfully'
      };
    }
    
    const { data, error } = await supabase.functions.invoke('create-mission', {
      body: missionData,
    })

    if (error) throw error
    return data
  }

  static async getUserMissions(userId: string, limit = 10): Promise<Mission[]> {
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return demoMissions.slice(0, limit);
    }
    
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching missions:', error)
      return demoMissions.slice(0, limit) // Fallback to demo data
    }

    return data || demoMissions.slice(0, limit)
  }

  static async getMissionContent(missionId: string, roomType?: string) {
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return {
        success: true,
        content: {
          learning_content: null, // Will be handled by individual room components
        }
      };
    }
    
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
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return {
        success: true,
        progress: progressData,
        xp_reward: 25,
        user_stats: demoUserStats,
        new_achievements: [],
        mission_completed: false
      };
    }
    
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

  static async getMissionProgress(userId: string, missionId: string): Promise<MissionProgress[]> {
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return [];
    }
    
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
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return demoUserAchievements;
    }
    
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching achievements:', error)
      return demoUserAchievements // Fallback to demo data
    }

    return data || demoUserAchievements
  }

  static async getAllAchievements(): Promise<Achievement[]> {
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return demoAchievements;
    }
    
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching achievements:', error)
      return demoAchievements // Fallback to demo data
    }

    return data || demoAchievements
  }

  // Subjects
  static async getSubjects(): Promise<Subject[]> {
    // Return demo data if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return demoSubjects;
    }
    
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching subjects:', error)
      return demoSubjects // Fallback to demo data
    }

    return data || demoSubjects
  }

  // Real-time subscriptions
  static subscribeToUserStats(userId: string, callback: (stats: UserStats) => void) {
    // Return mock subscription if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return { unsubscribe: () => {} };
    }
    
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
    // Return mock subscription if Supabase not configured
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return { unsubscribe: () => {} };
    }
    
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
      // Skip if Supabase not configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
        console.log(`Demo: User ${userId} performed: ${activity}`, metadata);
        return;
      }
      
      // Update last activity date
      await supabase
        .from('user_stats')
        .update({ 
          last_activity_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      // Log activity for analytics (you can expand this)
      console.log(`User ${userId} performed: ${activity}`, metadata)
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }

  // Marketing features
  static async getAppStats() {
    try {
      // Return demo data if Supabase not configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
        return demoAppStats;
      }
      
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
      return demoAppStats // Fallback to demo data
    }
  }
}