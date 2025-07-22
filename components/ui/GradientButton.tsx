import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  colors?: string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  glowEffect?: boolean;
}

export default function GradientButton({
  title,
  onPress,
  colors = theme.colors.gradient.primary,
  style,
  textStyle,
  disabled = false,
  size = 'medium',
  fullWidth = false,
  icon,
  glowEffect = true,
}: GradientButtonProps) {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    if (glowEffect && !disabled) {
      // Subtle glow animation
      glow.value = withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      );
      
      // Start shimmer animation
      const startShimmer = () => {
        shimmer.value = withTiming(1, { duration: 2500, easing: Easing.linear });
        
        // Reset and repeat
        setTimeout(() => {
          shimmer.value = 0;
          startShimmer();
        }, 2500);
      };
      
      startShimmer();
    }
  }, [glowEffect, disabled]);

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;
    
    // Press animation
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    onPress(event);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          paddingHorizontal: 16,
          fontSize: 14,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: 32,
          fontSize: 18,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: 24,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: disabled ? 0 : 0.3 + glow.value * 0.2,
    shadowRadius: disabled ? 0 : 12 + glow.value * 8,
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-200, 200]
    );
    
    return {
      transform: [
        { translateX },
        { rotate: '-30deg' }
      ],
      opacity: disabled ? 0 : 0.4,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width: fullWidth ? '100%' : undefined },
        animatedStyle,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <LinearGradient
          colors={disabled ? ['#64748b', '#475569'] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              height: sizeStyles.height,
              paddingHorizontal: sizeStyles.paddingHorizontal,
            },
          ]}
        >
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyles.fontSize,
                opacity: disabled ? 0.6 : 1,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          
          {/* Enhanced shimmer effect */}
          {glowEffect && !disabled && (
            <Animated.View style={[styles.shimmer, shimmerStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.4)', 'transparent']}
                style={styles.shimmerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.accent.purple,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  touchable: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  text: {
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.subheading,
    textAlign: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 200,
    height: '100%',
  },
  shimmerGradient: {
    flex: 1,
  },
});