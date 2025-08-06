import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Home, BookOpen, Plus, Trophy, User } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

export default function TabLayout() {
  const tabBarOpacity = useSharedValue(0);
  const tabBarTranslateY = useSharedValue(20);
  
  useEffect(() => {
    tabBarOpacity.value = withTiming(1, { duration: 800 });
    tabBarTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.back()) });
  }, []);
  
  const tabBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tabBarOpacity.value,
    transform: [{ translateY: tabBarTranslateY.value }],
  }));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <Animated.View style={[StyleSheet.absoluteFillObject, tabBarAnimatedStyle]}>
            <LinearGradient
              colors={[
                'rgba(15, 15, 35, 0.95)',
                'rgba(15, 15, 35, 1)',
              ]}
              style={[StyleSheet.absoluteFillObject, {
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }]}
            />
            {/* Material Design shadow */}
            <View style={styles.materialShadow} />
            {/* Top accent line */}
            <LinearGradient
              colors={[theme.colors.accent.purple, theme.colors.accent.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topAccent}
            />
          </Animated.View>
        ),
        tabBarActiveTintColor: theme.colors.accent.purple,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarShowLabel: false, // Hide labels for icon-only design
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
              <Home
                size={24}
                color={color}
                fill={focused ? color : 'transparent'}
              />
              {focused && (
                <View style={[styles.indicator, { backgroundColor: color }]} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
              <BookOpen
                size={24}
                color={color}
                fill={focused ? color : 'transparent'}
              />
              {focused && (
                <View style={[styles.indicator, { backgroundColor: color }]} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.createButtonContainer}>
              <LinearGradient
                colors={focused ? theme.colors.gradient.primary : [color + '40', color + '60']}
                style={[styles.createButton, focused && styles.createButtonFocused]}
              >
                <Plus
                  size={22}
                  color={theme.colors.text.primary}
                  strokeWidth={2.5}
                />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
              <Trophy
                size={24}
                color={color}
                fill={focused ? color : 'transparent'}
              />
              {focused && (
                <View style={[styles.indicator, { backgroundColor: color }]} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
              <User
                size={24}
                color={color}
                fill={focused ? color : 'transparent'}
              />
              {focused && (
                <View style={[styles.indicator, { backgroundColor: color }]} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  materialShadow: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 2,
    borderRadius: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 64,
    minHeight: 40,
    position: 'relative',
  },
  focusedIcon: {
    backgroundColor: theme.colors.accent.purple + '20',
  },
  indicator: {
    position: 'absolute',
    bottom: -2,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
  createButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.button,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: theme.colors.accent.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  createButtonFocused: {
    transform: [{ scale: 1.08 }],
  },
});