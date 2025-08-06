import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, Platform, StatusBar, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faHome,
  faGraduationCap,
  faPlus,
  faTrophy,
  faUser,
  faBookOpen,
  faChartLine,
  faMedal,
  faUserGraduate
} from '@fortawesome/pro-solid-svg-icons';
import { 
  faHome as faHomeLight,
  faGraduationCap as faGraduationCapLight,
  faPlus as faPlusLight,
  faTrophy as faTrophyLight,
  faUser as faUserLight
} from '@fortawesome/pro-light-svg-icons';
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
            height: Platform.OS === 'android' ? 65 : 90,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            paddingBottom: Platform.OS === 'android' ? 8 : 0,
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
                  borderTopLeftRadius: Platform.OS === 'android' ? 20 : 0,
                  borderTopRightRadius: Platform.OS === 'android' ? 20 : 0,
                }]}
              />
              {/* Android-style elevation shadow */}
              {Platform.OS === 'android' && (
                <View style={styles.androidShadow} />
              )}
            </Animated.View>
          ),
          tabBarActiveTintColor: theme.colors.accent.purple,
          tabBarInactiveTintColor: theme.colors.text.tertiary,
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: Platform.OS === 'android' ? 11 : 12,
            marginBottom: Platform.OS === 'android' ? 4 : 0,
            marginTop: Platform.OS === 'android' ? -2 : 0,
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === 'android' ? 6 : 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
                <FontAwesomeIcon
                  icon={focused ? faHome : faHomeLight}
                  size={Platform.OS === 'android' ? 22 : 24}
                  color={color}
                />
                {focused && Platform.OS === 'android' && (
                  <View style={[styles.androidIndicator, { backgroundColor: color }]} />
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
                <FontAwesomeIcon
                  icon={focused ? faGraduationCap : faGraduationCapLight}
                  size={Platform.OS === 'android' ? 22 : 24}
                  color={color}
                />
                {focused && Platform.OS === 'android' && (
                  <View style={[styles.androidIndicator, { backgroundColor: color }]} />
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
                    Platform.OS === 'android' && styles.androidCreateButton,
                    focused && styles.createButtonFocused
                  ]}
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    size={Platform.OS === 'android' ? 20 : 22}
                    color={theme.colors.text.primary}
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
                <FontAwesomeIcon
                  icon={focused ? faTrophy : faTrophyLight}
                  size={Platform.OS === 'android' ? 22 : 24}
                  color={color}
                />
                {focused && Platform.OS === 'android' && (
                  <View style={[styles.androidIndicator, { backgroundColor: color }]} />
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
                <FontAwesomeIcon
                  icon={focused ? faUser : faUserLight}
                  size={Platform.OS === 'android' ? 22 : 24}
                  color={color}
                />
                {focused && Platform.OS === 'android' && (
                  <View style={[styles.androidIndicator, { backgroundColor: color }]} />
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
  androidShadow: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: Platform.OS === 'android' ? 4 : 6,
    paddingHorizontal: Platform.OS === 'android' ? 12 : 8,
    borderRadius: Platform.OS === 'android' ? 16 : 8,
    minWidth: Platform.OS === 'android' ? 64 : 'auto',
  },
  focusedIcon: {
    backgroundColor: Platform.OS === 'android' 
      ? theme.colors.accent.purple + '15' 
      : theme.colors.accent.purple + '20',
  },
  androidIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  createButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'android' ? -8 : -12,
  },
  createButton: {
    width: Platform.OS === 'android' ? 56 : 48,
    height: Platform.OS === 'android' ? 56 : 48,
    borderRadius: Platform.OS === 'android' ? 28 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.button,
    elevation: Platform.OS === 'android' ? 6 : 8,
  },
  androidCreateButton: {
    shadowColor: theme.colors.accent.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createButtonFocused: {
    transform: [{ scale: Platform.OS === 'android' ? 1.05 : 1.1 }],
  },
  createButtonLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    textAlign: 'center',
  },
});