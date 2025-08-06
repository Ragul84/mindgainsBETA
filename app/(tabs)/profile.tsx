import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
import { User, Settings, Trophy, Star, Crown, Bell, Shield, CircleHelp as HelpCircle, LogOut, CreditCard as Edit3, Calendar, Target, Zap, BookOpen, ChevronRight, Share2, Camera, Mail, Phone, MapPin, Globe, Briefcase } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import MascotAvatar from '@/components/ui/MascotAvatar';
import CircleProgress from '@/components/ui/CircleProgress';
import GradientButton from '@/components/ui/GradientButton';
import { SupabaseService } from '@/utils/supabaseService';
import type { UserProfile, UserStats } from '@/utils/supabaseService';

const { width } = Dimensions.get('window');

// Floating particle component for premium effect
function FloatingParticle({ index }: { index: number }) {
  const translateY = useSharedValue(Math.random() * 800);
  const translateX = useSharedValue(Math.random() * width);
  const opacity = useSharedValue(0.1 + Math.random() * 0.2);
  const scale = useSharedValue(0.5 + Math.random() * 0.5);

  useEffect(() => {
    // Continuous floating animation
    const startAnimation = () => {
      translateY.value = withTiming(
        translateY.value - 100 - Math.random() * 200, 
        { duration: 8000 + Math.random() * 4000, easing: Easing.linear }
      );
      
      opacity.value = withSequence(
        withTiming(0.3, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      );
    };
    
    const timer = setTimeout(startAnimation, index * 200);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const icons = [Trophy, Star, Target, Zap, BookOpen, Crown];
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

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const profileOpacity = useSharedValue(0);
  const profileTranslateY = useSharedValue(30);
  const statsOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);
  const avatarScale = useSharedValue(1);

  useEffect(() => {
    loadUserData();
    
    // Start animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    
    profileOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    profileTranslateY.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
    
    statsOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    contentOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    
    // Continuous animations
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    
    // Avatar subtle animation
    avatarScale.value = withRepeat(
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

      const [profile, stats] = await Promise.all([
        SupabaseService.getProfile(user.id),
        SupabaseService.getUserStats(user.id)
      ]);

      setUserProfile(profile);
      setUserStats(stats);
      
      // Track profile view for analytics
      await SupabaseService.trackUserActivity(user.id, 'profile_view');
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = await SupabaseService.getCurrentUser();
              if (user) {
                await SupabaseService.trackUserActivity(user.id, 'sign_out');
              }
              await SupabaseService.signOut();
              router.replace('/auth');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const profileAnimatedStyle = useAnimatedStyle(() => ({
    opacity: profileOpacity.value,
    transform: [{ translateY: profileTranslateY.value }],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
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
  
  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const settingsItems: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Get notified about achievements and streaks',
      icon: <Bell size={20} color={theme.colors.text.primary} />,
      type: 'toggle',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      description: 'Use dark theme for better night studying',
      icon: <Shield size={20} color={theme.colors.text.primary} />,
      type: 'toggle',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      id: 'autoSync',
      title: 'Auto Sync',
      description: 'Automatically sync progress across devices',
      icon: <Settings size={20} color={theme.colors.text.primary} />,
      type: 'toggle',
      value: autoSync,
      onToggle: setAutoSync,
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: <HelpCircle size={20} color={theme.colors.text.primary} />,
      type: 'navigation',
      onPress: () => console.log('Help pressed'),
    },
    {
      id: 'share',
      title: 'Share App',
      icon: <Share2 size={20} color={theme.colors.text.primary} />,
      type: 'action',
      onPress: () => console.log('Share pressed'),
    },
    {
      id: 'logout',
      title: 'Sign Out',
      icon: <LogOut size={20} color={theme.colors.accent.pink} />,
      type: 'action',
      onPress: handleSignOut,
    },
  ];

  const handleEditProfile = () => {
    console.log('Edit profile pressed');
  };

  const handleViewAchievements = () => {
    router.push('/achievements');
  };

  // Calculate stats cards from real data
  const statCards: StatCard[] = [
    {
      title: 'Missions',
      value: userStats?.missions_completed?.toString() || '0',
      icon: <Target size={20} color={theme.colors.text.primary} />,
      color: theme.colors.accent.purple,
      trend: '+3 this week',
    },
    {
      title: 'Streak',
      value: `${userStats?.streak_days || 0} days`,
      icon: <Zap size={20} color={theme.colors.text.primary} />,
      color: theme.colors.accent.yellow,
      trend: userStats?.streak_days && userStats.streak_days > 0 ? 'Keep it up!' : 'Start today!',
    },
    {
      title: 'Level',
      value: userStats?.current_level?.toString() || '1',
      icon: <BookOpen size={20} color={theme.colors.text.primary} />,
      color: theme.colors.accent.cyan,
      trend: 'Level up!',
    },
    {
      title: 'Rank',
      value: userStats?.rank || 'Beginner',
      icon: <Crown size={20} color={theme.colors.text.primary} />,
      color: theme.colors.accent.green,
      trend: 'Rising!',
    },
  ];

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
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!userProfile) {
    return (
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.secondary,
          theme.colors.background.tertiary,
        ]}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <GradientButton
            title="Try Again"
            onPress={loadUserData}
            size="medium"
          />
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
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <LinearGradient
              colors={[theme.colors.background.card, theme.colors.background.secondary]}
              style={styles.editButtonGradient}
            >
              <Edit3 size={20} color={theme.colors.accent.purple} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View style={[styles.profileContainer, profileAnimatedStyle]}>
          <LinearGradient
            colors={[
              theme.colors.background.card,
              theme.colors.background.secondary,
            ]}
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Animated.View style={avatarAnimatedStyle}>
                  {userProfile.avatar_url ? (
                    <Image source={{ uri: userProfile.avatar_url }} style={styles.avatar} />
                  ) : (
                    <LinearGradient
                      colors={[theme.colors.accent.purple, theme.colors.accent.blue]}
                      style={styles.defaultAvatar}
                    >
                      <User size={40} color={theme.colors.text.primary} />
                    </LinearGradient>
                  )}
                </Animated.View>
                <TouchableOpacity style={styles.cameraButton}>
                  <LinearGradient
                    colors={[theme.colors.background.card, theme.colors.background.secondary]}
                    style={styles.cameraButtonGradient}
                  >
                    <Camera size={16} color={theme.colors.text.primary} />
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.levelBadge}>
                  <LinearGradient
                    colors={theme.colors.gradient.primary}
                    style={styles.levelBadgeGradient}
                  >
                    <Text style={styles.levelText}>{userStats?.current_level || 1}</Text>
                  </LinearGradient>
                </View>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userProfile.full_name || 'User'}</Text>
                <Text style={styles.userEmail}>{userProfile.email}</Text>
                <View style={styles.rankContainer}>
                  <Crown size={16} color={theme.colors.accent.yellow} />
                  <Text style={styles.rankText}>{userStats?.rank || 'Beginner'}</Text>
                </View>
              </View>

              <View style={styles.mascotContainer}>
                <MascotAvatar
                  size={60}
                  animated={true}
                  glowing={true}
                  mood="happy"
                />
              </View>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.profileDetailItem}>
                <Mail size={16} color={theme.colors.text.tertiary} />
                <Text style={styles.profileDetailText}>{userProfile.email}</Text>
              </View>
              
              {userProfile.bio && (
                <View style={styles.profileDetailItem}>
                  <Briefcase size={16} color={theme.colors.text.tertiary} />
                  <Text style={styles.profileDetailText}>{userProfile.bio}</Text>
                </View>
              )}
              
              <View style={styles.profileDetailItem}>
                <Calendar size={16} color={theme.colors.text.tertiary} />
                <Text style={styles.profileDetailText}>
                  Joined {new Date(userProfile.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.xpSection}>
              <View style={styles.xpInfo}>
                <Text style={styles.xpLabel}>Experience Points</Text>
                <Text style={styles.xpValue}>
                  {userStats?.total_xp?.toLocaleString() || '0'} / {nextLevelXP.toLocaleString()} XP
                </Text>
              </View>
              
              <CircleProgress
                value={userStats?.total_xp || 0}
                maxValue={nextLevelXP}
                size={80}
                strokeWidth={8}
                colors={theme.colors.gradient.primary}
              />
              
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
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          
          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <StatCard key={stat.title} stat={stat} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.quickActionsContainer, contentAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleViewAchievements}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.colors.gradient.secondary}
                style={styles.quickActionGradient}
              >
                <Trophy size={24} color={theme.colors.text.primary} />
                <Text style={styles.quickActionText}>View Achievements</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.quickActionGradient}
              >
                <Star size={24} color={theme.colors.text.primary} />
                <Text style={styles.quickActionText}>Learning History</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View style={[styles.settingsContainer, contentAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <LinearGradient
            colors={[
              theme.colors.background.card,
              theme.colors.background.secondary,
            ]}
            style={styles.settingsCard}
          >
            {settingsItems.map((item, index) => (
              <SettingItem key={item.id} item={item} index={index} />
            ))}
          </LinearGradient>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

function StatCard({ stat, index }: { stat: StatCard; index: number }) {
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

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <LinearGradient
        colors={[stat.color + '20', stat.color + '10']}
        style={styles.statCardGradient}
      >
        <View style={[styles.statIcon, { backgroundColor: stat.color + '30' }]}>
          {stat.icon}
        </View>
        
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statTitle}>{stat.title}</Text>
        
        {stat.trend && (
          <Text style={styles.statTrend}>{stat.trend}</Text>
        )}
        
        {/* Shimmer effect */}
        <View style={styles.statShimmerContainer}>
          <Animated.View style={[styles.statShimmer, shimmerAnimatedStyle]}>
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
  );
}

function SettingItem({ item, index }: { item: SettingItem; index: number }) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, index * 100);
  }, [index]);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    if (item.onPress) {
      item.onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.settingItem, animatedStyle]}>
      <TouchableOpacity 
        onPress={item.type !== 'toggle' ? handlePress : undefined}
        style={styles.settingButton}
        activeOpacity={item.type !== 'toggle' ? 0.8 : 1}
      >
        <View style={styles.settingContent}>
          <View style={[
            styles.settingIcon, 
            item.id === 'logout' && { backgroundColor: theme.colors.accent.pink + '20' }
          ]}>
            {item.icon}
          </View>
          
          <View style={styles.settingText}>
            <Text style={[
              styles.settingTitle,
              item.id === 'logout' && { color: theme.colors.accent.pink }
            ]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={styles.settingDescription}>{item.description}</Text>
            )}
          </View>

          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{
                false: theme.colors.background.tertiary,
                true: theme.colors.accent.purple + '50',
              }}
              thumbColor={item.value ? theme.colors.accent.purple : theme.colors.text.tertiary}
              ios_backgroundColor={theme.colors.background.tertiary}
            />
          )}

          {item.type === 'navigation' && (
            <ChevronRight size={20} color={theme.colors.text.tertiary} />
          )}
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  errorText: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
  },
  editButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  editButtonGradient: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  profileCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
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
    opacity: 0.4,
  },
  shimmerGradient: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    borderWidth: 3,
    borderColor: theme.colors.accent.purple,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  cameraButtonGradient: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.accent.purple,
  },
  levelBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  levelBadgeGradient: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.card,
  },
  levelText: {
    fontSize: 12,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  rankText: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.accent.yellow,
  },
  mascotContainer: {
    marginLeft: theme.spacing.sm,
  },
  profileDetails: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  profileDetailText: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  xpSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  xpInfo: {
    flex: 1,
  },
  xpLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  xpValue: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    width: '47%',
  },
  statCardGradient: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    position: 'relative',
    overflow: 'hidden',
  },
  statShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  statShimmer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 2,
    height: 200,
    opacity: 0.4,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  statTrend: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.accent.green,
  },
  quickActionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
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
  settingsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  settingsCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.tertiary,
  },
  settingButton: {
    padding: theme.spacing.lg,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});