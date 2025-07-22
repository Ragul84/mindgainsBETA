import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Crown, Trophy, Zap, Target } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import CircleProgress from './CircleProgress';
import MascotAvatar from './MascotAvatar';

const { width } = Dimensions.get('window');

interface XPProgressCardProps {
  currentXP: number;
  nextLevelXP: number;
  currentLevel: number;
  playerName: string;
  nextMilestone?: string;
  onViewQuests?: () => void;
  onViewProfile?: () => void;
}

export default function XPProgressCard({
  currentXP,
  nextLevelXP,
  currentLevel,
  playerName,
  nextMilestone = "Complete Next Mission",
  onViewQuests,
  onViewProfile,
}: XPProgressCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const xpPercentage = (currentXP / nextLevelXP) * 100;
  const xpToNext = nextLevelXP - currentXP;

  useEffect(() => {
    setIsVisible(true);
    cardOpacity.value = withTiming(1, { duration: 800 });
    cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });

    // Pulse animation
    const startPulse = () => {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    };

    const timer = setTimeout(startPulse, 1000);
    return () => clearTimeout(timer);
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { scale: cardScale.value },
      { scale: pulseScale.value },
    ],
  }));

  const handleCardPress = () => {
    cardScale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
  };

  return (
    <Animated.View style={[styles.container, cardAnimatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleCardPress}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[
            theme.colors.background.card,
            theme.colors.background.secondary,
            theme.colors.background.primary,
          ]}
          style={styles.card}
        >
          {/* Animated border glow */}
          <LinearGradient
            colors={[
              'transparent',
              theme.colors.accent.purple + '30',
              'transparent',
              theme.colors.accent.blue + '30',
              'transparent',
            ]}
            style={styles.borderGlow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Floating orbs */}
          <View style={styles.orbContainer}>
            <LinearGradient
              colors={[theme.colors.accent.purple + '20', 'transparent']}
              style={[styles.orb, styles.orb1]}
            />
            <LinearGradient
              colors={[theme.colors.accent.blue + '20', 'transparent']}
              style={[styles.orb, styles.orb2]}
            />
          </View>

          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{playerName}</Text>
              <View style={styles.levelBadge}>
                <Crown size={16} color={theme.colors.accent.yellow} />
                <Text style={styles.levelText}>Level {currentLevel}</Text>
              </View>
            </View>
            
            <LinearGradient
              colors={theme.colors.gradient.primary}
              style={styles.levelIndicator}
            >
              <Text style={styles.levelNumber}>{currentLevel}</Text>
            </LinearGradient>
          </View>

          {/* Mascot Section */}
          <View style={styles.mascotSection}>
            <View style={styles.progressContainer}>
              <CircleProgress
                value={currentXP}
                maxValue={nextLevelXP}
                size={128}
                strokeWidth={8}
                colors={theme.colors.gradient.primary}
              />
              <View style={styles.mascotContainer}>
                <MascotAvatar
                  size={96}
                  animated={true}
                  glowing={true}
                  mood="happy"
                />
              </View>
              
              {/* XP Badge */}
              <LinearGradient
                colors={theme.colors.gradient.success}
                style={styles.xpBadge}
              >
                <Text style={styles.xpBadgeText}>+XP</Text>
              </LinearGradient>
            </View>
          </View>

          {/* XP Progress Section */}
          <View style={styles.xpSection}>
            <View style={styles.xpNumbers}>
              <View style={styles.xpItem}>
                <Text style={styles.xpValue}>
                  {currentXP.toLocaleString()}
                </Text>
                <Text style={styles.xpLabel}>Current XP</Text>
              </View>
              <View style={styles.xpItem}>
                <Text style={styles.xpValue}>
                  {nextLevelXP.toLocaleString()}
                </Text>
                <Text style={styles.xpLabel}>Next Level</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={theme.colors.gradient.primary}
                  style={[styles.progressBarFill, { width: `${xpPercentage}%` }]}
                />
                <LinearGradient
                  colors={['transparent', '#ffffff30', 'transparent']}
                  style={styles.progressBarShine}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.xpRemaining}>
                {xpToNext.toLocaleString()} XP to next level
              </Text>
            </View>
          </View>

          {/* Next Milestone */}
          <LinearGradient
            colors={[
              theme.colors.accent.purple + '20',
              theme.colors.accent.blue + '20',
            ]}
            style={styles.milestone}
          >
            <View style={styles.milestoneContent}>
              <LinearGradient
                colors={theme.colors.gradient.secondary}
                style={styles.milestoneIcon}
              >
                <Trophy size={20} color={theme.colors.text.primary} />
              </LinearGradient>
              <View style={styles.milestoneText}>
                <Text style={styles.milestoneTitle}>Next Milestone</Text>
                <Text style={styles.milestoneDescription}>{nextMilestone}</Text>
              </View>
              <Zap size={24} color={theme.colors.accent.yellow} />
            </View>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onViewQuests}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.buttonGradient}
              >
                <Target size={18} color={theme.colors.text.primary} />
                <Text style={styles.buttonText}>View Quests</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onViewProfile}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.background.tertiary, theme.colors.background.secondary]}
                style={styles.buttonGradient}
              >
                <Crown size={18} color={theme.colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    alignSelf: 'center',
  },
  touchable: {
    borderRadius: theme.borderRadius.xl,
  },
  card: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.card,
  },
  borderGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: theme.borderRadius.xl,
    opacity: 0.5,
  },
  orbContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  orb: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  orb1: {
    top: -60,
    right: -60,
  },
  orb2: {
    bottom: -60,
    left: -60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  levelText: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.accent.yellow,
  },
  levelIndicator: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.button,
  },
  levelNumber: {
    fontSize: 16,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
  },
  mascotSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotContainer: {
    position: 'absolute',
  },
  xpBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.button,
  },
  xpBadgeText: {
    fontSize: 12,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  xpSection: {
    marginBottom: theme.spacing.lg,
  },
  xpNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  xpItem: {
    alignItems: 'center',
  },
  xpValue: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
  },
  xpLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  progressBarShine: {
    position: 'absolute',
    inset: 0,
    borderRadius: theme.borderRadius.sm,
  },
  xpRemaining: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
  },
  milestone: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.secondary,
  },
  milestoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneText: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  milestoneDescription: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  primaryButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  secondaryButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
});