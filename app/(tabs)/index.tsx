import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { 
  Zap, 
  Target, 
  Brain, 
  Trophy, 
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Play,
  Plus,
  BookOpen,
  Star,
  Crown,
  ArrowRight
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import MascotAvatar from '@/components/ui/MascotAvatar';
import GradientButton from '@/components/ui/GradientButton';
import CircleProgress from '@/components/ui/CircleProgress';
import { SupabaseService } from '@/utils/supabaseService';
import type { UserProfile, UserStats, Mission } from '@/utils/supabaseService';

const { width, height } = Dimensions.get('window');

// Floating particle component for premium effect
function FloatingParticle({ index }: { index: number }) {
  const translateY = useSharedValue(Math.random() * height);
  const translateX = useSharedValue(Math.random() * width);
  const opacity = useSharedValue(0.1 + Math.random() * 0.2);
  const scale = useSharedValue(0.5 + Math.random() * 0.5);

  useEffect(() => {
    // Continuous floating animation
    translateY.value = withRepeat(
      withSequence(
        withTiming(translateY.value - 20 - Math.random() * 40, { 
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin)
        }),
        withTiming(translateY.value + 20 + Math.random() * 40, { 
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin)
        })
      ),
      -1,
      true
    );
    
    // Subtle opacity pulsing
    opacity.value = withRepeat(
      withSequence(
        withTiming(opacity.value + 0.1, { 
          duration: 2000 + Math.random() * 1000,
          easing: Easing.inOut(Easing.sin)
        }),
        withTiming(opacity.value, { 
          duration: 2000 + Math.random() * 1000,
          easing: Easing.inOut(Easing.sin)
        })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const icons = [Brain, Sparkles, Zap, Target, BookOpen, Trophy, Crown, Star];
  const IconComponent = icons[index % icons.length];
  const colors = [
    theme.colors.accent.purple,
    theme.colors.accent.blue,
    theme.colors.accent.cyan,
    theme.colors.accent.yellow,
    theme.colors.accent.green,
    theme.colors.accent.pink,
  ];

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <IconComponent 
        size={12 + Math.random() * 8} 
        color={colors[index % colors.length]} 
      />
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentMissions, setRecentMissions] = useState<Mission[]>([]);
  const [appStats, setAppStats] = useState({ totalUsers: 0, totalMissions: 0, activeUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const mascotScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);
  const statsScale = useSharedValue(0.9);
  const shimmerPosition = useSharedValue(-1);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    loadUserData();
    
    // Entrance animations
    cardOpacity.value = withTiming(1, { duration: 800 });
    cardTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.back()) });
    statsScale.value = withSpring(1, { damping: 15, stiffness: 100 });

    // Mascot breathing animation
    mascotScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    
    // Shimmer animation
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    
    // Glow effect
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const loadUserData = async () => {
    try {
      // Check if Supabase is configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
        // Use demo data for development
        setUserProfile({
          id: 'demo-user',
          user_id: 'demo-user',
          email: 'demo@mindgains.ai',
          full_name: 'Demo Student',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        setUserStats({
          id: 'demo-stats',
          user_id: 'demo-user',
          total_xp: 2450,
          current_level: 5,
          missions_completed: 12,
          streak_days: 7,
          last_activity_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        setRecentMissions([
          {
            id: 'demo-1',
            user_id: 'demo-user',
            title: 'Indian Constitution - Fundamental Rights',
            description: 'Master Articles 12-35 for UPSC Prelims',
            subject_id: null,
            content_type: 'text',
            content_text: 'Fundamental Rights',
            difficulty: 'medium',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-2',
            user_id: 'demo-user',
            title: 'Mughal Empire Timeline',
            description: 'Complete history from Babur to Aurangzeb',
            subject_id: null,
            content_type: 'text',
            content_text: 'Mughal Empire',
            difficulty: 'hard',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        
        setAppStats({ totalUsers: 125000, totalMissions: 45000, activeUsers: 8500 });
        setIsLoading(false);
        return;
      }
      
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
        // For demo purposes, don't redirect immediately
        console.log('No user found, using demo data');
        setUserProfile(null);
        setUserStats(null);
        setRecentMissions([]);
        setAppStats({ totalUsers: 125000, totalMissions: 45000, activeUsers: 8500 });
        setIsLoading(false);
        return;
      }

      const [profile, stats, missions, globalStats] = await Promise.all([
        SupabaseService.getProfile(user.id),
        SupabaseService.getUserStats(user.id),
        SupabaseService.getUserMissions(user.id, 5),
        SupabaseService.getAppStats()
      ]);

      setUserProfile(profile);
      setUserStats(stats);
      setRecentMissions(missions);
      setAppStats(globalStats);
      
      // Track user activity for analytics
      await SupabaseService.trackUserActivity(user.id, 'dashboard_view');
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statsScale.value }],
  }));

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
  }));
  
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-width * 1.5, width * 1.5]
    );
    
    return {
      transform: [
        { translateX },
        { rotate: '-30deg' }
      ],
    };
  });
  
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + glowIntensity.value * 0.4,
    shadowRadius: 20 + glowIntensity.value * 30,
  }));

  const handleStartNewMission = () => {
    router.push('/create');
  };

  const handleContinueMission = (mission: Mission) => {
    router.push({
      pathname: '/mission/clarity',
      params: {
        missionId: mission.id,
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.accent.green;
      case 'medium': return theme.colors.accent.yellow;
      case 'hard': return theme.colors.accent.pink;
      default: return theme.colors.accent.blue;
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.secondary,
          theme.colors.background.tertiary,
        ]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <MascotAvatar size={100} animated={true} glowing={true} mood="focused" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  const nextLevelXP = userStats ? (userStats.current_level * userStats.current_level * 100) : 1000;

  return (
    <LinearGradient
      colors={[
        theme.colors.background.primary,
        theme.colors.background.secondary,
        theme.colors.background.tertiary,
      ]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background particles */}
      <View style={styles.particlesContainer}>
        {[...Array(15)].map((_, index) => (
          <FloatingParticle key={index} index={index} />
        ))}
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent.purple}
            colors={[theme.colors.accent.purple]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Namaste,</Text>
              <Text style={styles.userName}>
                {userProfile?.full_name ? `${userProfile.full_name.split(' ')[0]}! 🚀` : 'Ready to learn? 🚀'}
              </Text>
              <Text style={styles.userSubtext}>
                Join {appStats.totalUsers.toLocaleString()}+ students mastering competitive exams
              </Text>
            </View>
            <Animated.View style={[mascotAnimatedStyle, glowAnimatedStyle]}>
              <MascotAvatar
                size={70}
                animated={true}
                glowing={true}
                mood="happy"
              />
            </Animated.View>
          </View>
        </View>

        {/* Stats Overview */}
        <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
          <LinearGradient
            colors={[
              theme.colors.background.card,
              theme.colors.background.secondary,
            ]}
            style={styles.statsCard}
          >
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Your Progress</Text>
              <TrendingUp size={20} color={theme.colors.accent.green} />
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient
                    colors={theme.colors.gradient.primary}
                    style={styles.statIcon}
                  >
                    <Trophy size={20} color={theme.colors.text.primary} />
                  </LinearGradient>
                </View>
                <Text style={styles.statValue}>Level {userStats?.current_level || 1}</Text>
                <Text style={styles.statLabel}>Current Level</Text>
              </View>

              <View style={styles.statItem}>
                <CircleProgress
                  value={userStats?.total_xp || 0}
                  maxValue={nextLevelXP}
                  size={70}
                  strokeWidth={8}
                  colors={theme.colors.gradient.primary}
                />
                <Text style={styles.statValue}>{userStats?.total_xp || 0} XP</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient
                    colors={theme.colors.gradient.secondary}
                    style={styles.statIcon}
                  >
                    <Zap size={20} color={theme.colors.text.primary} />
                  </LinearGradient>
                </View>
                <Text style={styles.statValue}>{userStats?.streak_days || 0} days</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
            
            {/* Improved shimmer effect */}
            <View style={styles.shimmerContainer}>
              <Animated.View style={[styles.shimmerOverlay, shimmerAnimatedStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.quickActionsContainer, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleStartNewMission}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.quickActionGradient}
              >
                <Plus size={24} color={theme.colors.text.primary} />
                <Text style={styles.quickActionText}>New Mission</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.colors.gradient.secondary}
                style={styles.quickActionGradient}
              >
                <Clock size={24} color={theme.colors.text.primary} />
                <Text style={styles.quickActionText}>Quick Review</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recent Missions */}
        <Animated.View style={[styles.recentMissionsContainer, cardAnimatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={theme.colors.accent.purple} />
            </TouchableOpacity>
          </View>

          {recentMissions.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.missionsScroll}
            >
              {recentMissions.map((mission, index) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onPress={() => handleContinueMission(mission)}
                  index={index}
                  getDifficultyColor={getDifficultyColor}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Brain size={48} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyStateText}>No missions yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first learning mission to get started!</Text>
              <GradientButton
                title="Create Mission"
                onPress={handleStartNewMission}
                size="medium"
                style={styles.emptyStateButton}
                icon={<Plus size={18} color={theme.colors.text.primary} />}
              />
            </View>
          )}
        </Animated.View>

        {/* Exam Prep Recommendations */}
        <Animated.View style={[styles.recommendationsContainer, cardAnimatedStyle]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Crown size={20} color={theme.colors.accent.yellow} />
              <Text style={styles.sectionTitle}>Exam Prep Recommendations</Text>
            </View>
          </View>

          <View style={styles.recommendationsGrid}>
            <RecommendationCard
              title="UPSC Prelims"
              description="Indian Polity & Constitution"
              icon={<BookOpen size={24} color={theme.colors.text.primary} />}
              color={theme.colors.accent.purple}
              onPress={handleStartNewMission}
            />
            <RecommendationCard
              title="JEE Mains"
              description="Physics Mechanics"
              icon={<Zap size={24} color={theme.colors.text.primary} />}
              color={theme.colors.accent.blue}
              onPress={handleStartNewMission}
            />
            <RecommendationCard
              title="Banking Exams"
              description="Current Affairs"
              icon={<Target size={24} color={theme.colors.text.primary} />}
              color={theme.colors.accent.green}
              onPress={handleStartNewMission}
            />
            <RecommendationCard
              title="NEET"
              description="Human Physiology"
              icon={<Brain size={24} color={theme.colors.text.primary} />}
              color={theme.colors.accent.pink}
              onPress={handleStartNewMission}
            />
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

function MissionCard({ mission, onPress, index, getDifficultyColor }: {
  mission: Mission;
  onPress: () => void;
  index: number;
  getDifficultyColor: (difficulty: string) => string;
}) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      
      // Start shimmer animation
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }, index * 150);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-width, width]
    );
    
    return {
      transform: [
        { translateX },
        { rotate: '-30deg' }
      ],
    };
  });

  // Calculate progress from mission_progress if available
  const progress = 25; // Default progress, would be calculated from actual progress data
  const isCompleted = mission.status === 'completed';

  return (
    <Animated.View style={[styles.missionCard, animatedStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={[
            theme.colors.background.card,
            theme.colors.background.secondary,
          ]}
          style={styles.missionCardGradient}
        >
          <View style={styles.missionImageContainer}>
            <LinearGradient
              colors={[theme.colors.accent.purple + '40', theme.colors.accent.blue + '40']}
              style={styles.missionImagePlaceholder}
            >
              <Brain size={32} color={theme.colors.text.primary} />
            </LinearGradient>
            
            <View style={styles.missionBadge}>
              <LinearGradient
                colors={[theme.colors.accent.yellow, theme.colors.accent.green]}
                style={styles.missionBadgeGradient}
              >
                <Star size={12} color={theme.colors.text.primary} />
                <Text style={styles.missionBadgeText}>AI-Powered</Text>
              </LinearGradient>
            </View>
            
            {/* Shimmer effect for image */}
            <View style={styles.missionImageShimmerContainer}>
              <Animated.View style={[styles.missionImageShimmer, shimmerAnimatedStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          </View>
          
          <View style={styles.missionContent}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionTitle} numberOfLines={2}>
                {mission.title}
              </Text>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(mission.difficulty) + '20' }
              ]}>
                <Text style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(mission.difficulty) }
                ]}>
                  {mission.difficulty}
                </Text>
              </View>
            </View>

            {mission.description && (
              <Text style={styles.missionDescription} numberOfLines={2}>
                {mission.description}
              </Text>
            )}

            <View style={styles.missionProgress}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={theme.colors.gradient.primary}
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>

            <View style={styles.missionFooter}>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  {isCompleted ? 'Completed' : 'In Progress'}
                </Text>
              </View>
              {!isCompleted && (
                <TouchableOpacity style={styles.continueButton}>
                  <LinearGradient
                    colors={[theme.colors.accent.purple, theme.colors.accent.blue]}
                    style={styles.continueButtonGradient}
                  >
                    <Play size={12} color={theme.colors.text.primary} />
                    <Text style={styles.continueText}>Continue</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function RecommendationCard({ title, description, icon, color, onPress }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const shimmerPosition = useSharedValue(-1);
  
  useEffect(() => {
    // Start shimmer animation
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 120 })
    );
    onPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-width, width]
    );
    
    return {
      transform: [
        { translateX },
        { rotate: '-30deg' }
      ],
    };
  });
  
  return (
    <Animated.View style={[styles.recommendationCard, animatedStyle]}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.recommendationTouchable}
      >
        <LinearGradient
          colors={[color + '20', color + '10']}
          style={styles.recommendationGradient}
        >
          <View style={[styles.recommendationIcon, { backgroundColor: color + '30' }]}>
            {icon}
          </View>
          <Text style={styles.recommendationTitle}>{title}</Text>
          <Text style={styles.recommendationDescription}>{description}</Text>
          <View style={styles.recommendationAction}>
            <ArrowRight size={16} color={color} />
          </View>
          
          {/* Shimmer effect */}
          <View style={styles.recommendationShimmerContainer}>
            <Animated.View style={[styles.recommendationShimmer, shimmerAnimatedStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
  },
  userName: {
    fontSize: 28,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  userSubtext: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  statsCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.card,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 2,
    height: 200,
    opacity: 0.6,
  },
  shimmerGradient: {
    flex: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    marginBottom: theme.spacing.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
  },
  quickActionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  quickActionGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickActionText: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  recentMissionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.accent.purple,
  },
  missionsScroll: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateButton: {
    marginTop: theme.spacing.md,
  },
  missionCard: {
    width: 280,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  missionCardGradient: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    ...theme.shadows.card,
  },
  missionImageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  missionImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionImageShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  missionImageShimmer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 2,
    height: 200,
    opacity: 0.4,
  },
  missionBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  missionBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  missionBadgeText: {
    fontSize: 10,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.primary,
  },
  missionContent: {
    padding: theme.spacing.md,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  missionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: theme.fonts.caption,
    textTransform: 'uppercase',
  },
  missionDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  missionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  progressText: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    minWidth: 35,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
  },
  continueButton: {
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  continueText: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.primary,
  },
  recommendationsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  recommendationCard: {
    width: '47%',
  },
  recommendationTouchable: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  recommendationGradient: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    borderRadius: theme.borderRadius.lg,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  recommendationShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  recommendationShimmer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 2,
    height: 200,
    opacity: 0.4,
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  recommendationTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  recommendationDescription: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  recommendationAction: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
  },
  bottomSpacing: {
    height: 20,
  },
});