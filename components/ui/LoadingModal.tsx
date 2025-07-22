import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Brain, Sparkles, Zap, BookOpen } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import MascotAvatar from './MascotAvatar';

interface LoadingModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  progress?: number;
}

const { width } = Dimensions.get('window');

export default function LoadingModal({
  visible,
  title = "Generating Content",
  message = "Creating your AI-powered learning mission...",
  progress = 0
}: LoadingModalProps) {
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const progressValue = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withTiming(1, { duration: 300 });
      
      // Start animations
      sparkleRotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
      
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
    }
  }, [visible]);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 500 });
  }, [progress]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, modalAnimatedStyle]}>
          <LinearGradient
            colors={[
              theme.colors.background.card,
              theme.colors.background.secondary,
            ]}
            style={styles.modalGradient}
          >
            {/* Floating Elements */}
            <View style={styles.floatingElements}>
              <Animated.View style={[styles.floatingIcon, styles.icon1, sparkleAnimatedStyle]}>
                <Sparkles size={16} color={theme.colors.accent.yellow} />
              </Animated.View>
              <Animated.View style={[styles.floatingIcon, styles.icon2, sparkleAnimatedStyle]}>
                <Brain size={14} color={theme.colors.accent.purple} />
              </Animated.View>
              <Animated.View style={[styles.floatingIcon, styles.icon3, sparkleAnimatedStyle]}>
                <Zap size={12} color={theme.colors.accent.cyan} />
              </Animated.View>
              <Animated.View style={[styles.floatingIcon, styles.icon4, sparkleAnimatedStyle]}>
                <BookOpen size={14} color={theme.colors.accent.green} />
              </Animated.View>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              {/* Mascot */}
              <Animated.View style={pulseAnimatedStyle}>
                <MascotAvatar
                  size={100}
                  animated={true}
                  glowing={true}
                  mood="focused"
                />
              </Animated.View>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Message */}
              <Text style={styles.message}>{message}</Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
                  <LinearGradient
                    colors={['transparent', '#ffffff30', 'transparent']}
                    style={styles.progressShine}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>

              {/* Loading Steps */}
              <View style={styles.stepsContainer}>
                <LoadingStep 
                  text="Analyzing content for Indian exams..." 
                  completed={progress > 20} 
                  active={progress <= 20} 
                />
                <LoadingStep 
                  text="Creating Room of Clarity content..." 
                  completed={progress > 50} 
                  active={progress > 20 && progress <= 50} 
                />
                <LoadingStep 
                  text="Preparing quiz questions..." 
                  completed={progress > 80} 
                  active={progress > 50 && progress <= 80} 
                />
                <LoadingStep 
                  text="Finalizing learning mission..." 
                  completed={progress > 95} 
                  active={progress > 80} 
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

function LoadingStep({ text, completed, active }: {
  text: string;
  completed: boolean;
  active: boolean;
}) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (completed) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    } else if (active) {
      opacity.value = withTiming(0.8, { duration: 300 });
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(0.3, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [completed, active]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.step, animatedStyle]}>
      <View style={[
        styles.stepIndicator,
        completed && styles.stepCompleted,
        active && styles.stepActive
      ]}>
        {completed ? (
          <Sparkles size={12} color={theme.colors.text.primary} />
        ) : (
          <View style={styles.stepDot} />
        )}
      </View>
      <Text style={[
        styles.stepText,
        completed && styles.stepTextCompleted,
        active && styles.stepTextActive
      ]}>
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modal: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  modalGradient: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingIcon: {
    position: 'absolute',
    opacity: 0.6,
  },
  icon1: {
    top: 20,
    right: 20,
  },
  icon2: {
    top: 60,
    left: 20,
  },
  icon3: {
    bottom: 80,
    right: 30,
  },
  icon4: {
    bottom: 40,
    left: 30,
  },
  content: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent.purple,
    borderRadius: theme.borderRadius.sm,
  },
  progressShine: {
    position: 'absolute',
    inset: 0,
    borderRadius: theme.borderRadius.sm,
  },
  progressText: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  stepsContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.tertiary,
  },
  stepCompleted: {
    backgroundColor: theme.colors.accent.green,
    borderColor: theme.colors.accent.green,
  },
  stepActive: {
    backgroundColor: theme.colors.accent.purple + '30',
    borderColor: theme.colors.accent.purple,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.tertiary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
  },
  stepTextCompleted: {
    color: theme.colors.accent.green,
    fontFamily: theme.fonts.subheading,
  },
  stepTextActive: {
    color: theme.colors.accent.purple,
    fontFamily: theme.fonts.subheading,
  },
});