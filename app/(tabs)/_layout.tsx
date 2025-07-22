import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { Chrome as Home, BookOpen, Trophy, User, Plus } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

export default function TabLayout() {
  // Animation for tab bar entrance
  const tabBarOpacity = useSharedValue(0);
  const tabBarTranslateY = useSharedValue(20);
  
  useEffect(() => {
    // Animate tab bar entrance
    tabBarOpacity.value = withTiming(1, { duration: 800 });
    tabBarTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.back()) });
  }, []);
  
  const tabBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tabBarOpacity.value,
    transform: [{ translateY: tabBarTranslateY.value }],
  }));

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: Platform.OS === 'ios' ? 90 : 70,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarBackground: () => (
            <Animated.View style={[StyleSheet.absoluteFillObject, tabBarAnimatedStyle]}>
              <LinearGradient
                colors={[
                  'rgba(15, 15, 35, 0)',
                  'rgba(15, 15, 35, 0.8)',
                  'rgba(15, 15, 35, 0.95)',
                ]}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          ),
          tabBarActiveTintColor: theme.colors.accent.purple,
          tabBarInactiveTintColor: theme.colors.text.tertiary,
          tabBarLabelStyle: {
            fontFamily: theme.fonts.caption,
            fontSize: 12,
            marginBottom: Platform.OS === 'ios' ? 0 : 8,
          },
          tabBarIconStyle: {
            marginTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <Home size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Learn',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <BookOpen size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color, size, focused }) => (
              <LinearGradient
                colors={focused ? theme.colors.gradient.primary : [color, color]}
                style={[styles.createButton, focused && styles.createButtonFocused]}
              >
                <Plus size={size + 4} color={theme.colors.text.primary} strokeWidth={2.5} />
              </LinearGradient>
            ),
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: 'Achievements',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <Trophy size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 4,
    borderRadius: 8,
  },
  focusedIcon: {
    backgroundColor: theme.colors.accent.purple + '20',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8,
    ...theme.shadows.button,
  },
  createButtonFocused: {
    transform: [{ scale: 1.1 }],
  },
});