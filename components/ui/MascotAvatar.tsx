import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface MascotAvatarProps {
  size?: number;
  imageUrl?: string;
  animated?: boolean;
  glowing?: boolean;
  mood?: 'happy' | 'excited' | 'focused' | 'celebrating';
}

export default function MascotAvatar({
  size = 80,
  imageUrl,
  animated = true,
  glowing = true,
  mood = 'happy',
}: MascotAvatarProps) {
  // Initialize all shared values as numbers
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      // Breathing animation
      scale.value = withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      );
      
      // Repeat the animation
      const interval = setInterval(() => {
        scale.value = withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        );
      }, 4000);

      // Subtle rotation
      rotation.value = withSequence(
        withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      );
      
      // Repeat rotation
      const rotationInterval = setInterval(() => {
        rotation.value = withSequence(
          withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        );
      }, 9000);
      
      return () => {
        clearInterval(interval);
        clearInterval(rotationInterval);
      };
    }

    if (glowing) {
      glowScale.value = withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      );
      
      // Repeat glow
      const glowInterval = setInterval(() => {
        glowScale.value = withSequence(
          withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        );
      }, 3000);
      
      return () => clearInterval(glowInterval);
    }
  }, [animated, glowing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.6,
  }));

  const getMoodColor = () => {
    switch (mood) {
      case 'excited':
        return theme.colors.gradient.secondary;
      case 'focused':
        return ['#3b82f6', '#1e40af'];
      case 'celebrating':
        return ['#fbbf24', '#f59e0b'];
      default:
        return theme.colors.gradient.mascot;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glowing background */}
      {glowing && (
        <Animated.View
          style={[
            styles.glowContainer,
            { width: size * 1.4, height: size * 1.4 },
            glowAnimatedStyle,
          ]}
        >
          <LinearGradient
            colors={[...getMoodColor(), 'transparent']}
            style={styles.glow}
          />
        </Animated.View>
      )}

      {/* Main avatar container */}
      <Animated.View style={[styles.avatarContainer, animatedStyle]}>
        <LinearGradient
          colors={getMoodColor()}
          style={[styles.avatarBackground, { width: size, height: size }]}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.avatarImage, { width: size - 8, height: size - 8 }]}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Sparkles
                size={size * 0.4}
                color={theme.colors.text.primary}
                strokeWidth={2}
              />
            </View>
          )}
        </LinearGradient>

        {/* Floating sparkles */}
        {mood === 'celebrating' && (
          <View style={styles.sparklesContainer}>
            {[...Array(3)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.sparkle,
                  {
                    top: Math.random() * size,
                    left: Math.random() * size,
                  },
                ]}
              >
                <Sparkles
                  size={8}
                  color={theme.colors.accent.yellow}
                  strokeWidth={2}
                />
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.full,
    opacity: 0.3,
  },
  avatarContainer: {
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.card,
  },
  avatarBackground: {
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatarImage: {
    borderRadius: theme.borderRadius.full,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparklesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
  },
});