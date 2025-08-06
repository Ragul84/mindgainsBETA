import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { 
  Trophy,
  Star,
  Target,
  Zap,
  Crown,
  Medal,
  Award,
  Flame,
  Brain,
  BookOpen,
  Clock,
  Users,
  ArrowLeft,
  Sparkles
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import CircleProgress from '@/components/ui/CircleProgress';
import MascotAvatar from '@/components/ui/MascotAvatar';

const { width, height } = Dimensions.get('window');

import { SupabaseService } from '@/utils/supabaseService';
import type { Achievement as SupabaseAchievement, UserAchievement } from '@/utils/supabaseService';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'speed' | 'streak' | 'social' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  total?: number;
  xpReward: number;
}

interface AchievementCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  unlockedCount: number;
}

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

  const icons = [Trophy, Star, Target, Zap, Crown, Medal, Award, Flame];
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

const categories: AchievementCategory[] = [
  {
    id: 'learning',
    name: 'Learning',
    icon: <Brain size={20} color={theme.colors.text.primary} />,
    color: theme.colors.accent.purple,
    count: 12,
    unlockedCount: 8,
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: <Zap size={20} color={theme.colors.text.primary} />,
    color: theme.colors.accent.yellow,
    count: 8,
    unlockedCount: 5,
  },
  {
    id: 'streak',
    name: 'Streak',
    icon: <Flame size={20} color={theme.colors.text.primary} />,
    color: theme.colors.accent.pink,
    count: 6,
    unlockedCount: 4,
  },
  {
    id: 'social',
    name: 'Social',
    icon: <Users size={20} color={theme.colors.text.primary} />,
    color: theme.colors.accent.cyan,
    count: 5,
    unlockedCount: 2,
  },
  {
    id: 'mastery',
    name: 'Mastery',
    icon: <Crown size={20} color={theme.colors.text.primary} />,
    color: theme.colors.accent.green,
    count: 10,
    unlockedCount: 6,
  },
];

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first learning mission',
    icon: '🎯',
    category: 'learning',
    rarity: 'common',
    unlocked: true,
    unlockedAt: '2024-01-15',
    xpReward: 50,
  },
  {
    id: '2',
    title: 'Speed Demon',
    description: 'Complete a mission in under 5 minutes',
    icon: '⚡',
    category: 'speed',
    rarity: 'rare',
    unlocked: true,
    unlockedAt: '2024-01-18',
    xpReward: 100,
  },
  {
    id: '3',
    title: 'Perfect Score',
    description: 'Get 100% on any test',
    icon: '🏆',
    category: 'mastery',
    rarity: 'epic',
    unlocked: true,
    unlockedAt: '2024-01-22',
    xpReward: 200,
  },
  {
    id: '4',
    title: 'Knowledge Seeker',
    description: 'Complete 50 missions',
    icon: '📚',
    category: 'learning',
    rarity: 'epic',
    unlocked: false,
    progress: 23,
    total: 50,
    xpReward: 300,
  },
  {
    id: '5',
    title: 'Lightning Fast',
    description: 'Complete 10 missions in under 3 minutes each',
    icon: '🌟',
    category: 'speed',
    rarity: 'legendary',
    unlocked: false,
    progress: 3,
    total: 10,
    xpReward: 500,
  },
  {
    id: '6',
    title: 'Streak Master',
    description: 'Maintain a 30-day learning streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'legendary',
    unlocked: false,
    progress: 7,
    total: 30,
    xpReward: 400,
  },
  {
    id: '7',
    title: 'Social Butterfly',
    description: 'Share 5 achievements with friends',
    icon: '🦋',
    category: 'social',
    rarity: 'rare',
    unlocked: false,
    progress: 1,
    total: 5,
    xpReward: 150,
  },
  {
    id: '8',
    title: 'Subject Master',
    description: 'Complete all missions in a subject',
    icon: '👑',
    category: 'mastery',
    rarity: 'epic',
    unlocked: true,
    unlockedAt: '2024-01-25',
    xpReward: 250,
  },
];

export default function AchievementsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [achievements, setAchievements] = useState<SupabaseAchievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalXP: 0,
    rareAchievements: 0,
  });

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const statsOpacity = useSharedValue(0);
  const statsTranslateY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);
  const trophyScale = useSharedValue(1);

  useEffect(() => {
    loadAchievements();
    
    // Start animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.back()) });
    
    statsOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    statsTranslateY.value = withDelay(200, withSpring(0, { damping: 12, stiffness: 120 }));
    
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    
    // Continuous animations
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    
    trophyScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const loadAchievements = async () => {
    try {
      // Check if Supabase is configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
        // Use demo achievements data
        const demoAchievements = [
          {
            id: '1',
            name: 'First Steps',
            description: 'Complete your first learning mission',
            icon: '🎯',
            category: 'learning',
            required_value: 1,
            xp_reward: 50,
            badge_color: theme.colors.accent.green,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Speed Demon',
            description: 'Complete a mission in under 5 minutes',
            icon: '⚡',
            category: 'speed',
            required_value: 1,
            xp_reward: 100,
            badge_color: theme.colors.accent.yellow,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Perfect Score',
            description: 'Get 100% on any test',
            icon: '🏆',
            category: 'mastery',
            required_value: 1,
            xp_reward: 200,
            badge_color: theme.colors.accent.purple,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ];
        
        const demoUserAchievements = [
          {
            id: 'ua1',
            user_id: 'demo-user',
            achievement_id: '1',
            progress: 1,
            completed: true,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: 'ua2',
            user_id: 'demo-user',
            achievement_id: '2',
            progress: 1,
            completed: true,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        ];
        
        setAchievements(demoAchievements);
        setUserAchievements(demoUserAchievements);
        
        // Calculate demo stats
        setUserStats({
          totalAchievements: demoAchievements.length,
          unlockedAchievements: demoUserAchievements.length,
          totalXP: 150,
          rareAchievements: 1,
        });
        
        // Set demo categories
        setCategories([
          {
            id: 'learning',
            name: 'Learning',
            icon: <Brain size={20} color={theme.colors.text.primary} />,
            color: theme.colors.accent.purple,
            count: 1,
            unlockedCount: 1,
          },
          {
            id: 'speed',
            name: 'Speed',
            icon: <Zap size={20} color={theme.colors.text.primary} />,
            color: theme.colors.accent.yellow,
            count: 1,
            unlockedCount: 1,
          },
          {
            id: 'mastery',
            name: 'Mastery',
            icon: <Crown size={20} color={theme.colors.text.primary} />,
            color: theme.colors.accent.green,
            count: 1,
            unlockedCount: 0,
          },
        ]);
        
        setIsLoading(false);
        return;
      }
      
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
        console.log('No user found for achievements');
        setIsLoading(false);
        return;
      }

      const [allAchievements, userAchievementsList] = await Promise.all([
        SupabaseService.getAllAchievements(),
        SupabaseService.getUserAchievements(user.id)
      ]);

      setAchievements(allAchievements);
      setUserAchievements(userAchievementsList);

      // Calculate stats
      const unlockedIds = new Set(userAchievementsList.map(ua => ua.achievement_id));
      const unlockedAchievements = allAchievements.filter(a => unlockedIds.has(a.id));
      const rareAchievements = unlockedAchievements.filter(a => a.rarity !== 'common');
      const totalXP = unlockedAchievements.reduce((sum, a) => sum + a.xp_reward, 0);

      setUserStats({
        totalAchievements: allAchievements.length,
        unlockedAchievements: unlockedAchievements.length,
        totalXP,
        rareAchievements: rareAchievements.length,
      });

      // Calculate categories
      const categoryStats = [
        {
          id: 'learning',
          name: 'Learning',
          icon: <Brain size={20} color={theme.colors.text.primary} />,
          color: theme.colors.accent.purple,
          count: allAchievements.filter(a => a.category === 'learning').length,
          unlockedCount: unlockedAchievements.filter(a => a.category === 'learning').length,
        },
        {
          id: 'speed',
          name: 'Speed',
          icon: <Zap size={20} color={theme.colors.text.primary} />,
          color: theme.colors.accent.yellow,
          count: allAchievements.filter(a => a.category === 'speed').length,
          unlockedCount: unlockedAchievements.filter(a => a.category === 'speed').length,
        },
        {
          id: 'streak',
          name: 'Streak',
          icon: <Flame size={20} color={theme.colors.text.primary} />,
          color: theme.colors.accent.pink,
          count: allAchievements.filter(a => a.category === 'streak').length,
          unlockedCount: unlockedAchievements.filter(a => a.category === 'streak').length,
        },
        {
          id: 'social',
          name: 'Social',
          icon: <Users size={20} color={theme.colors.text.primary} />,
          color: theme.colors.accent.cyan,
          count: allAchievements.filter(a => a.category === 'social').length,
          unlockedCount: unlockedAchievements.filter(a => a.category === 'social').length,
        },
        {
          id: 'mastery',
          name: 'Mastery',
          icon: <Crown size={20} color={theme.colors.text.primary} />,
          color: theme.colors.accent.green,
          count: allAchievements.filter(a => a.category === 'mastery').length,
          unlockedCount: unlockedAchievements.filter(a => a.category === 'mastery').length,
        },
      ];

      setCategories(categoryStats);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
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
  
  const trophyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    return categoryMatch;
  });

  const isAchievementUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getAchievementProgress = (achievementId: string) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievementId);
    return userAchievement ? { unlocked: true, unlockedAt: userAchievement.earned_at } : { unlocked: false };
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.secondary,
        ]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <MascotAvatar size={80} animated={true} glowing={true} mood="focused" />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </LinearGradient>
  );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return theme.colors.text.secondary;
      case 'rare': return theme.colors.accent.blue;
      case 'epic': return theme.colors.accent.purple;
      case 'legendary': return theme.colors.accent.yellow;
      default: return theme.colors.text.secondary;
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return [theme.colors.background.tertiary, theme.colors.background.secondary];
      case 'rare': return [theme.colors.accent.blue + '30', theme.colors.accent.cyan + '30'];
      case 'epic': return [theme.colors.accent.purple + '30', theme.colors.accent.pink + '30'];
      case 'legendary': return [theme.colors.accent.yellow + '30', theme.colors.accent.green + '30'];
      default: return [theme.colors.background.tertiary, theme.colors.background.secondary];
    }
  };

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
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerContent}>
            <Animated.View style={trophyAnimatedStyle}>
              <LinearGradient
                colors={[theme.colors.accent.yellow, theme.colors.accent.yellow + '80']}
                style={styles.trophyContainer}
              >
                <Trophy size={32} color={theme.colors.text.primary} />
              </LinearGradient>
            </Animated.View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Achievements</Text>
              <Text style={styles.headerSubtitle}>
                {userStats.unlockedAchievements} of {userStats.totalAchievements} unlocked
              </Text>
            </View>
          </View>
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
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CircleProgress
                  value={userStats.unlockedAchievements}
                  maxValue={userStats.totalAchievements}
                  size={80}
                  strokeWidth={8}
                  colors={theme.colors.gradient.primary}
                />
                <Text style={styles.statLabel}>Progress</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient
                    colors={theme.colors.gradient.secondary}
                    style={styles.statIcon}
                  >
                    <Star size={24} color={theme.colors.text.primary} />
                  </LinearGradient>
                </View>
                <Text style={styles.statValue}>{userStats.totalXP}</Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <LinearGradient
                    colors={[theme.colors.accent.purple, theme.colors.accent.pink]}
                    style={styles.statIcon}
                  >
                    <Medal size={24} color={theme.colors.text.primary} />
                  </LinearGradient>
                </View>
                <Text style={styles.statValue}>{userStats.rareAchievements}</Text>
                <Text style={styles.statLabel}>Rare+</Text>
              </View>
            </View>
            
            {/* Improved shimmer effect */}
            <View style={styles.shimmerContainer}>
              <Animated.View style={[styles.shimmerOverlay, shimmerAnimatedStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View style={[styles.categoriesContainer, contentAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Categories</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <CategoryCard
              category={{
                id: 'all',
                name: 'All',
                icon: <Award size={20} color={theme.colors.text.primary} />,
                color: theme.colors.accent.purple,
                count: userStats.totalAchievements,
                unlockedCount: userStats.unlockedAchievements,
              }}
              isSelected={selectedCategory === 'all'}
              onPress={() => setSelectedCategory('all')}
            />
            
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                index={index + 1}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Achievements List */}
        <Animated.View style={[styles.achievementsContainer, contentAnimatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' 
                ? 'All Achievements' 
                : categories.find(c => c.id === selectedCategory)?.name + ' Achievements'
              }
            </Text>
            <Text style={styles.achievementCount}>
              {filteredAchievements.filter(a => a.unlocked).length} / {filteredAchievements.length}
            </Text>
          </View>

          <View style={styles.achievementsList}>
            {filteredAchievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={isAchievementUnlocked(achievement.id)}
                progressData={getAchievementProgress(achievement.id)}
                index={index}
                getRarityColor={getRarityColor}
                getRarityGradient={getRarityGradient}
              />
            ))}
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

function CategoryCard({ category, isSelected, onPress, index = 0 }: {
  category: AchievementCategory;
  isSelected: boolean;
  onPress: () => void;
  index?: number;
}) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, index * 100);
    
    // Shimmer animation for selected card
    if (isSelected) {
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [index, isSelected]);
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 120 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-120, 120]
    );
    
    return {
      transform: [
        { translateX },
        { rotate: '-30deg' }
      ],
    };
  });

  return (
    <Animated.View style={[styles.categoryCard, animatedStyle]}>
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected 
            ? [category.color + '40', category.color + '20']
            : [theme.colors.background.card, theme.colors.background.secondary]
          }
          style={[styles.categoryCardGradient, isSelected && styles.selectedCategory]}
        >
          <View style={[
            styles.categoryIcon,
            { backgroundColor: category.color + '20' }
          ]}>
            {category.icon}
          </View>
          
          <Text style={[
            styles.categoryName,
            isSelected && { color: category.color }
          ]}>
            {category.name}
          </Text>
          
          <Text style={styles.categoryProgress}>
            {category.unlockedCount}/{category.count}
          </Text>
          
          <View style={styles.categoryProgressBar}>
            <LinearGradient
              colors={[category.color, category.color + '80']}
              style={[
                styles.categoryProgressFill,
                { width: `${(category.unlockedCount / category.count) * 100}%` }
              ]}
            />
          </View>
          
          {/* Shimmer effect for selected category */}
          {isSelected && (
            <View style={styles.categoryShimmerContainer}>
              <Animated.View style={[styles.categoryShimmer, shimmerAnimatedStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function AchievementCard({ achievement, index, getRarityColor, getRarityGradient }: {
  achievement: Achievement;
  isUnlocked: boolean;
  progressData: { unlocked: boolean; unlockedAt?: string };
  index: number;
  getRarityColor: (rarity: string) => string;
  getRarityGradient: (rarity: string) => string[];
}) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, index * 100);
    
    // Shimmer animation for unlocked achievements
    if (isUnlocked) {
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [index, isUnlocked]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
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
  
  const handlePress = () => {
    if (isUnlocked) {
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 120 })
      );
    }
  };

  return (
    <Animated.View style={[styles.achievementCard, animatedStyle]}>
      <TouchableOpacity 
        activeOpacity={isUnlocked ? 0.8 : 1}
        onPress={handlePress}
      >
        <LinearGradient
          colors={isUnlocked 
            ? getRarityGradient(achievement.rarity)
            : [theme.colors.background.tertiary, theme.colors.background.secondary]
          }
          style={[
            styles.achievementGradient,
            isUnlocked && styles.unlockedAchievement
          ]}
        >
          <View style={styles.achievementHeader}>
            <View style={[
              styles.achievementIcon,
              { 
                backgroundColor: isUnlocked 
                  ? getRarityColor(achievement.rarity) + '20'
                  : theme.colors.background.tertiary 
              }
            ]}>
              <Text style={[
                styles.achievementEmoji,
                !isUnlocked && styles.lockedEmoji
              ]}>
                {isUnlocked ? (achievement.icon || '🏆') : '🔒'}
              </Text>
            </View>
            
            <View style={styles.achievementInfo}>
              <View style={styles.achievementTitleRow}>
                <Text style={[
                  styles.achievementTitle,
                  !isUnlocked && styles.lockedText
                ]}>
                  {achievement.title}
                </Text>
                
                <View style={[
                  styles.rarityBadge,
                  { backgroundColor: getRarityColor(achievement.rarity) + '20' }
                ]}>
                  <Text style={[
                    styles.rarityText,
                    { color: getRarityColor(achievement.rarity) }
                  ]}>
                    {achievement.rarity.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={[
                styles.achievementDescription,
                !isUnlocked && styles.lockedText
              ]}>
                {achievement.description}
              </Text>
            </View>
          </View>

          <View style={styles.achievementFooter}>
            <View style={styles.xpReward}>
              <Star size={16} color={theme.colors.accent.yellow} />
              <Text style={styles.xpText}>{achievement.xp_reward} XP</Text>
            </View>
            
            {isUnlocked && progressData.unlockedAt && (
              <Text style={styles.unlockedDate}>
                Unlocked {new Date(progressData.unlockedAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          {isUnlocked && (
            <View style={styles.unlockedBadge}>
              <LinearGradient
                colors={[theme.colors.accent.green, theme.colors.accent.cyan]}
                style={styles.unlockedBadgeGradient}
              >
                <Trophy size={16} color={theme.colors.text.primary} />
              </LinearGradient>
            </View>
          )}
          
          {/* Improved shimmer effect for unlocked achievements */}
          {isUnlocked && (
            <View style={styles.achievementShimmerContainer}>
              <Animated.View style={[styles.achievementShimmer, shimmerAnimatedStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          )}
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
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  trophyContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
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
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
  },
  categoriesContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  categoriesScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  categoryCard: {
    width: 120,
  },
  categoryCardGradient: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedCategory: {
    borderColor: theme.colors.accent.purple,
    shadowColor: theme.colors.accent.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  categoryShimmer: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    opacity: 0.6,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryProgress: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  categoryProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  achievementsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  achievementCount: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
  },
  achievementsList: {
    gap: theme.spacing.md,
  },
  achievementCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  achievementGradient: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    position: 'relative',
    overflow: 'hidden',
  },
  achievementShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  achievementShimmer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 2,
    height: 200,
    opacity: 0.4,
  },
  unlockedAchievement: {
    borderColor: theme.colors.border.primary,
    shadowColor: theme.colors.accent.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  lockedEmoji: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  achievementTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  rarityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  rarityText: {
    fontSize: 10,
    fontFamily: theme.fonts.caption,
    fontWeight: 'bold',
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  lockedText: {
    opacity: 0.6,
  },
  progressSection: {
    marginBottom: theme.spacing.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  progressText: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  xpText: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.accent.yellow,
  },
  unlockedDate: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
  },
  unlockedBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  unlockedBadgeGradient: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  bottomSpacing: {
    height: 20,
  },
});