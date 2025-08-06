import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
} from 'react-native-reanimated';
import { 
  Zap, 
  Target, 
  Brain, 
  Trophy, 
  Clock,
  TrendingUp,
  Sparkles,
  Play,
  Star,
  Crown,
  ArrowRight,
  Calendar,
  Users,
  Award
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import MascotAvatar from '@/components/ui/MascotAvatar';
import GradientButton from '@/components/ui/GradientButton';
import CircleProgress from '@/components/ui/CircleProgress';
import { SupabaseService } from '@/utils/supabaseService';
import type { UserProfile, UserStats, DailyQuiz } from '@/utils/supabaseService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [todayQuiz, setTodayQuiz] = useState<DailyQuiz | null>(null);
  const [mascotMessage, setMascotMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const mascotScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);
  const statsScale = useSharedValue(0.9);

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
  }, []);

  const loadUserData = async () => {
    try {
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
        router.replace('/auth');
        return;
      }

      const [profile, stats, quiz, recommendations] = await Promise.all([
        SupabaseService.getProfile(user.id),
        SupabaseService.getUserStats(user.id),
        SupabaseService.getTodayQuiz(),
        SupabaseService.getMascotRecommendations(user.id)
      ]);

      setUserProfile(profile);
      setUserStats(stats);
      setTodayQuiz(quiz);
      setMascotMessage(recommendations[0] || "Ready to boost your knowledge today? 🚀");
      
      // Track user activity
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

  const handleStartDailyQuiz = async () => {
    try {
      let quiz = todayQuiz;
      if (!quiz) {
        quiz = await SupabaseService.generateDailyQuiz();
        setTodayQuiz(quiz);
      }
      
      router.push({
        pathname: '/quiz/daily',
        params: { quizId: quiz.id }
      });
    } catch (error) {
      console.error('Error starting daily quiz:', error);
    }
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

  const nextLevelXP = userStats ? (userStats.current_level * 1000) : 1000;

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
                {userProfile?.full_name ? `${userProfile.full_name.split(' ')[0]}! 🇮🇳` : 'Knowledge Seeker! 🇮🇳'}
              </Text>
              <Text style={styles.userSubtext}>
                Building intellectual India, one mind at a time
              </Text>
            </View>
            <Animated.View style={mascotAnimatedStyle}>
              <MascotAvatar
                size={70}
                animated={true}
                glowing={true}
                mood="happy"
              />
            </Animated.View>
          </View>
        </View>

        {/* Mascot Message */}
        <Animated.View style={[styles.mascotMessageContainer, cardAnimatedStyle]}>
          <LinearGradient
            colors={[
              theme.colors.background.card,
              theme.colors.background.secondary,
            ]}
            style={styles.mascotMessageCard}
          >
            <View style={styles.mascotMessageContent}>
              <Brain size={20} color={theme.colors.accent.purple} />
              <Text style={styles.mascotMessageText}>{mascotMessage}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

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
                  strokeWidth={6}
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
          </LinearGradient>
        </Animated.View>

        {/* Daily Quiz */}
        <Animated.View style={[styles.dailyQuizContainer, cardAnimatedStyle]}>
          <LinearGradient
            colors={[theme.colors.accent.purple + '20', theme.colors.accent.blue + '20']}
            style={styles.dailyQuizCard}
          >
            <View style={styles.dailyQuizHeader}>
              <View style={styles.dailyQuizTitleContainer}>
                <Calendar size={24} color={theme.colors.accent.purple} />
                <Text style={styles.dailyQuizTitle}>Today's Quiz</Text>
              </View>
              <View style={styles.dailyQuizBadge}>
                <Star size={16} color={theme.colors.accent.yellow} />
                <Text style={styles.dailyQuizBadgeText}>Daily</Text>
              </View>
            </View>
            
            <Text style={styles.dailyQuizDescription}>
              10 questions covering Indian History, Polity, Geography & Current Affairs
            </Text>
            
            <View style={styles.dailyQuizMeta}>
              <View style={styles.dailyQuizMetaItem}>
                <Clock size={16} color={theme.colors.text.tertiary} />
                <Text style={styles.dailyQuizMetaText}>~5 minutes</Text>
              </View>
              <View style={styles.dailyQuizMetaItem}>
                <Target size={16} color={theme.colors.text.tertiary} />
                <Text style={styles.dailyQuizMetaText}>100 points</Text>
              </View>
            </View>

            <GradientButton
              title="Start Daily Quiz"
              onPress={handleStartDailyQuiz}
              size="large"
              fullWidth
              icon={<Play size={20} color={theme.colors.text.primary} />}
              colors={[theme.colors.accent.purple, theme.colors.accent.blue]}
              style={styles.dailyQuizButton}
            />
          </LinearGradient>
        </Animated.View>

        {/* Subject Categories */}
        <Animated.View style={[styles.subjectsContainer, cardAnimatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Subjects</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/learn')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight size={16} color={theme.colors.accent.purple} />
            </TouchableOpacity>
          </View>

          <View style={styles.subjectsGrid}>
            {[
              { name: 'History', icon: '🏛️', color: theme.colors.accent.purple },
              { name: 'Polity', icon: '⚖️', color: theme.colors.accent.blue },
              { name: 'Geography', icon: '🌍', color: theme.colors.accent.green },
              { name: 'Economy', icon: '💰', color: theme.colors.accent.yellow },
            ].map((subject, index) => (
              <TouchableOpacity
                key={subject.name}
                style={styles.subjectCard}
                onPress={() => router.push({
                  pathname: '/quiz/subject',
                  params: { subject: subject.name }
                })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[subject.color + '20', subject.color + '10']}
                  style={styles.subjectCardGradient}
                >
                  <Text style={styles.subjectIcon}>{subject.icon}</Text>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <View style={styles.subjectAction}>
                    <Play size={16} color={subject.color} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Leaderboard Preview */}
        <Animated.View style={[styles.leaderboardContainer, cardAnimatedStyle]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Crown size={20} color={theme.colors.accent.yellow} />
              <Text style={styles.sectionTitle}>Leaderboard</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>View All</Text>
              <ArrowRight size={16} color={theme.colors.accent.purple} />
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={[
              theme.colors.background.card,
              theme.colors.background.secondary,
            ]}
            style={styles.leaderboardCard}
          >
            <View style={styles.leaderboardHeader}>
              <Text style={styles.leaderboardTitle}>Top Performers This Week</Text>
              <Users size={16} color={theme.colors.text.tertiary} />
            </View>
            
            <View style={styles.leaderboardList}>
              {[
                { rank: 1, name: 'Arjun S.', xp: 2450, avatar: '👨‍🎓' },
                { rank: 2, name: 'Priya K.', xp: 2380, avatar: '👩‍🎓' },
                { rank: 3, name: 'Rahul M.', xp: 2290, avatar: '👨‍💼' },
              ].map((user, index) => (
                <View key={user.rank} style={styles.leaderboardItem}>
                  <View style={styles.leaderboardRank}>
                    <Text style={styles.leaderboardRankText}>{user.rank}</Text>
                  </View>
                  <Text style={styles.leaderboardAvatar}>{user.avatar}</Text>
                  <Text style={styles.leaderboardName}>{user.name}</Text>
                  <Text style={styles.leaderboardXP}>{user.xp} XP</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity style={styles.viewFullLeaderboard}>
              <Text style={styles.viewFullLeaderboardText}>View Full Leaderboard</Text>
              <ArrowRight size={16} color={theme.colors.accent.purple} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  mascotMessageContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  mascotMessageCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  mascotMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  mascotMessageText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.text.primary,
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
  dailyQuizContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  dailyQuizCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.card,
  },
  dailyQuizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dailyQuizTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dailyQuizTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
  },
  dailyQuizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent.yellow + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  dailyQuizBadgeText: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.accent.yellow,
  },
  dailyQuizDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  dailyQuizMeta: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  dailyQuizMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dailyQuizMetaText: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
  },
  dailyQuizButton: {
    marginTop: theme.spacing.md,
  },
  subjectsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
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
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  subjectCard: {
    width: '47%',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  subjectCardGradient: {
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    minHeight: 120,
    position: 'relative',
  },
  subjectIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  subjectName: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subjectAction: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
  },
  leaderboardContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  leaderboardCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.card,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  leaderboardList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.tertiary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  leaderboardRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accent.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: 12,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  leaderboardAvatar: {
    fontSize: 20,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.text.primary,
  },
  leaderboardXP: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
  },
  viewFullLeaderboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  viewFullLeaderboardText: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.accent.purple,
  },
  bottomSpacing: {
    height: 20,
  },
});