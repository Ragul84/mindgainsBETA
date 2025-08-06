import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, Platform, StatusBar, Text } from 'react-native';
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
            height: Platform.OS === 'android' ? 70 : 90,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            paddingBottom: Platform.OS === 'android' ? 12 : 0,
            paddingTop: Platform.OS === 'android' ? 8 : 0,
          },
          tabBarBackground: () => (
            <Animated.View style={[StyleSheet.absoluteFillObject, tabBarAnimatedStyle]}>
              <LinearGradient
                colors={[
                  'rgba(15, 15, 35, 0.95)',
                  'rgba(15, 15, 35, 0.98)',
                  'rgba(15, 15, 35, 1)',
                ]}
                style={[StyleSheet.absoluteFillObject, {
                  borderTopLeftRadius: Platform.OS === 'android' ? 24 : 0,
                  borderTopRightRadius: Platform.OS === 'android' ? 24 : 0,
                }]}
              />
              {/* Android Material Design shadow */}
              {Platform.OS === 'android' && (
                <View style={styles.materialShadow} />
              )}
              {/* Subtle border for Android */}
              {Platform.OS === 'android' && (
                <View style={styles.topBorder} />
              )}
            </Animated.View>
          ),
          tabBarActiveTintColor: theme.colors.accent.purple,
          tabBarInactiveTintColor: theme.colors.text.tertiary,
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: Platform.OS === 'android' ? 12 : 12,
            marginBottom: Platform.OS === 'android' ? 0 : 0,
            marginTop: Platform.OS === 'android' ? 4 : 0,
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === 'android' ? 4 : 8,
            marginBottom: Platform.OS === 'android' ? 0 : 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <Home
                  size={Platform.OS === 'android' ? 24 : 24}
                  color={color}
                  fill={focused ? color : 'transparent'}
                />
                {focused && Platform.OS === 'android' && (
                  <View style={[styles.materialIndicator, { backgroundColor: color }]} />
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Learn',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <BookOpen
                  size={Platform.OS === 'android' ? 24 : 24}
                  color={color}
                  fill={focused ? color : 'transparent'}
                />
                {focused && Platform.OS === 'android' && (
                  <View style={[styles.materialIndicator, { backgroundColor: color }]} />
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.createButtonContainer}>
                <LinearGradient
                  colors={focused ? theme.colors.gradient.primary : [color + '40', color + '60']}
                  style={[
                    styles.createButton,
                    Platform.OS === 'android' && styles.materialCreateButton,
                    focused && styles.createButtonFocused
                  ]}
                >
                  <Plus
                    size={Platform.OS === 'android' ? 22 : 22}
                    color={theme.colors.text.primary}
                    strokeWidth={2.5}
                  />
                </LinearGradient>
                {Platform.OS === 'android' && (
                  <Text style={[
                    styles.createButtonLabel,
                    { color: focused ? theme.colors.accent.purple : theme.colors.text.tertiary }
                  ]}>
                    Create
                  </Text>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: 'Achievements',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <Trophy
                  size={Platform.OS === 'android' ? 24 : 24}
                  color={color}
                  fill={focused ? color : 'transparent'}
                />
                {focused && Platform.OS === 'android' && (
                  <View style={[styles.materialIndicator, { backgroundColor: color }]} />
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <User
                  size={Platform.OS === 'android' ? 24 : 24}
                  color={color}
                  fill={focused ? color : 'transparent'}
                />
                {focused && Platform.OS === 'android' && (
                  <View style={[styles.materialIndicator, { backgroundColor: color }]} />
                )}
              </View>
            ),
          }}
        />
      </Tabs>
    </>
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
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: Platform.OS === 'android' ? 6 : 6,
    paddingHorizontal: Platform.OS === 'android' ? 16 : 8,
    borderRadius: Platform.OS === 'android' ? 20 : 8,
    minWidth: Platform.OS === 'android' ? 72 : 'auto',
    minHeight: Platform.OS === 'android' ? 40 : 'auto',
  },
  focusedIcon: {
    backgroundColor: Platform.OS === 'android' 
      ? theme.colors.accent.purple + '20' 
      : theme.colors.accent.purple + '20',
  },
  materialIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
  createButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'android' ? -12 : -12,
  },
  createButton: {
    width: Platform.OS === 'android' ? 56 : 48,
    height: Platform.OS === 'android' ? 56 : 48,
    borderRadius: Platform.OS === 'android' ? 28 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.button,
    elevation: Platform.OS === 'android' ? 8 : 8,
    borderWidth: Platform.OS === 'android' ? 2 : 0,
    borderColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.1)' : 'transparent',
  },
  materialCreateButton: {
    shadowColor: theme.colors.accent.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  createButtonFocused: {
    transform: [{ scale: Platform.OS === 'android' ? 1.08 : 1.1 }],
  },
  createButtonLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    marginTop: 6,
    textAlign: 'center',
  },
});