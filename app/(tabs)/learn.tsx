import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
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
import { 
  Search,
  Filter,
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Bookmark,
  TrendingUp,
  Sparkles,
  Zap,
  Crown,
  Target,
  Brain,
  ArrowRight
} from 'lucide-react-native';
import { theme } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

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

  const icons = [Brain, Sparkles, Zap, Target, BookOpen, Crown, Star];
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

// Real data from Supabase
interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  students: number;
  rating: number;
  image: string;
  instructor: string;
  progress?: number;
  isBookmarked: boolean;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  courseCount: number;
}

export default function LearnScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const searchOpacity = useSharedValue(0);
  const searchTranslateY = useSharedValue(20);
  const contentOpacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    loadContent();
    
    // Start animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.back()) });
    
    searchOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    searchTranslateY.value = withDelay(200, withSpring(0, { damping: 12, stiffness: 120 }));
    
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    
    // Continuous shimmer animation
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const loadContent = async () => {
    try {
      // Load subjects from Supabase
      const supabaseSubjects = await SupabaseService.getSubjects();
      
      // Transform subjects data
      const transformedSubjects = supabaseSubjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        icon: getSubjectIcon(subject.name),
        color: subject.color || getSubjectColor(subject.name),
        courseCount: Math.floor(Math.random() * 30) + 5, // Will be real data from missions count
      }));
      
      setSubjects(transformedSubjects);
      
      // Load featured courses (these would come from a courses table in production)
      const featuredCourses: Course[] = [
        {
          id: '1',
          title: 'Indian Polity & Constitution',
          description: 'Master the core concepts of Indian Constitution with focus on UPSC Prelims and Mains questions.',
          subject: 'UPSC',
          difficulty: 'Advanced',
          duration: '8 weeks',
          students: 1234,
          rating: 4.8,
          image: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600',
          instructor: 'Dr. Rajesh Sharma',
          progress: 65,
          isBookmarked: true,
        },
        {
          id: '2',
          title: 'Physics for JEE Advanced',
          description: 'Comprehensive physics course covering mechanics, thermodynamics, and electromagnetism for JEE aspirants.',
          subject: 'JEE/NEET',
          difficulty: 'Advanced',
          duration: '10 weeks',
          students: 892,
          rating: 4.6,
          image: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
          instructor: 'Prof. Sunita Verma',
          isBookmarked: false,
        },
        {
          id: '3',
          title: 'Modern Indian History',
          description: 'Complete timeline of Indian freedom struggle with focus on important events and personalities.',
          subject: 'UPSC',
          difficulty: 'Intermediate',
          duration: '6 weeks',
          students: 567,
          rating: 4.9,
          image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
          instructor: 'Dr. Vikram Singh',
          progress: 30,
          isBookmarked: true,
        },
        {
          id: '4',
          title: 'Banking Awareness',
          description: 'Essential banking concepts, financial institutions, and current affairs for banking exams.',
          subject: 'Banking',
          difficulty: 'Beginner',
          duration: '4 weeks',
          students: 2156,
          rating: 4.7,
          image: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=400',
          instructor: 'Priya Mehta',
          isBookmarked: false,
        },
      ];
      
      setCourses(featuredCourses);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectIcon = (name: string): string => {
    const iconMap: Record<string, string> = {
      'UPSC': '🏛️',
      'JEE/NEET': '🔬',
      'Banking': '💰',
      'SSC': '📝',
      'State PCS': '🗺️',
      'GATE': '💻',
      'History': '📚',
      'Geography': '🌍',
      'Science': '⚗️',
      'Mathematics': '📐',
      'English': '📖',
      'General Studies': '🎯',
    };
    return iconMap[name] || '📚';
  };

  const getSubjectColor = (name: string): string => {
    const colorMap: Record<string, string> = {
      'UPSC': theme.colors.accent.purple,
      'JEE/NEET': theme.colors.accent.green,
      'Banking': theme.colors.accent.yellow,
      'SSC': theme.colors.accent.blue,
      'State PCS': theme.colors.accent.pink,
      'GATE': theme.colors.accent.cyan,
    };
    return colorMap[name] || theme.colors.accent.purple;
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    opacity: searchOpacity.value,
    transform: [{ translateY: searchTranslateY.value }],
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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
                         (selectedFilter === 'In Progress' && course.progress) ||
                         (selectedFilter === 'Bookmarked' && course.isBookmarked) ||
                         course.difficulty === selectedFilter;
    const matchesSubject = !selectedSubject || course.subject === selectedSubject;
    
    return matchesSearch && matchesFilter && matchesSubject;
  });

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
          <Text style={styles.headerTitle}>Discover & Learn</Text>
          <Text style={styles.headerSubtitle}>India's best exam-focused courses</Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
          <LinearGradient
            colors={[
              theme.colors.background.card,
              theme.colors.background.secondary,
            ]}
            style={styles.searchBar}
          >
            <Search size={20} color={theme.colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses, subjects..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color={theme.colors.accent.purple} />
            </TouchableOpacity>
            
            {/* Improved shimmer effect */}
            <View style={styles.searchShimmerContainer}>
              <Animated.View style={[styles.searchShimmer, shimmerAnimatedStyle]}>
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

        {/* Filter Tabs */}
        <Animated.View style={[styles.filtersContainer, contentAnimatedStyle]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {['All', 'In Progress', 'Bookmarked', 'Beginner', 'Intermediate', 'Advanced'].map((filter) => (
              <FilterTab
                key={filter}
                title={filter}
                isSelected={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Subjects Grid */}
        <Animated.View style={[styles.subjectsContainer, contentAnimatedStyle]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Crown size={20} color={theme.colors.accent.yellow} />
              <Text style={styles.sectionTitle}>Exam Categories</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.subjectsGrid}>
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isSelected={selectedSubject === subject.name}
                onPress={() => setSelectedSubject(
                  selectedSubject === subject.name ? null : subject.name
                )}
                index={index}
              />
            ))}
          </View>
        </Animated.View>

        {/* Featured Course */}
        <Animated.View style={[styles.featuredContainer, contentAnimatedStyle]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Sparkles size={20} color={theme.colors.accent.purple} />
              <Text style={styles.sectionTitle}>Featured Course</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.featuredCard}
          >
            <LinearGradient
              colors={[theme.colors.accent.purple + '30', theme.colors.accent.blue + '30']}
              style={styles.featuredGradient}
            >
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <LinearGradient
                    colors={[theme.colors.accent.yellow, theme.colors.accent.green]}
                    style={styles.featuredBadgeGradient}
                  >
                    <Star size={12} color={theme.colors.text.primary} />
                    <Text style={styles.featuredBadgeText}>UPSC SPECIAL</Text>
                  </LinearGradient>
                </View>
                
                <Text style={styles.featuredTitle}>Complete UPSC Prelims Mastery</Text>
                <Text style={styles.featuredDescription}>
                  Comprehensive course covering all subjects for UPSC Civil Services Preliminary Examination
                </Text>
                
                <View style={styles.featuredMeta}>
                  <View style={styles.featuredMetaItem}>
                    <Users size={14} color={theme.colors.text.primary} />
                    <Text style={styles.featuredMetaText}>5,234 students</Text>
                  </View>
                  <View style={styles.featuredMetaItem}>
                    <Star size={14} color={theme.colors.accent.yellow} fill={theme.colors.accent.yellow} />
                    <Text style={styles.featuredMetaText}>4.9</Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.featuredButton}>
                  <LinearGradient
                    colors={[theme.colors.accent.purple, theme.colors.accent.blue]}
                    style={styles.featuredButtonGradient}
                  >
                    <Text style={styles.featuredButtonText}>Enroll Now</Text>
                    <ArrowRight size={16} color={theme.colors.text.primary} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <View style={styles.featuredImageContainer}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600' }}
                  style={styles.featuredImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(15, 15, 35, 0.8)']}
                  style={styles.featuredImageOverlay}
                />
              </View>
              
              {/* Shimmer effect */}
              <View style={styles.featuredShimmerContainer}>
                <Animated.View style={[styles.featuredShimmer, shimmerAnimatedStyle]}>
                  <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.shimmerGradient}
                  />
                </Animated.View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Trending Courses */}
        <Animated.View style={[styles.coursesContainer, contentAnimatedStyle]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <TrendingUp size={20} color={theme.colors.accent.green} />
              <Text style={styles.sectionTitle}>
                {selectedSubject ? `${selectedSubject} Courses` : 'Trending Courses'}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.coursesList}>
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                onPress={() => {
                  // Navigate to course details
                  console.log('Open course:', course.id);
                }}
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

function FilterTab({ title, isSelected, onPress }: {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 120 })
    );
    onPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected 
            ? theme.colors.gradient.primary 
            : [theme.colors.background.tertiary, theme.colors.background.secondary]
          }
          style={[styles.filterTab, isSelected && styles.selectedFilterTab]}
        >
          <Text style={[
            styles.filterTabText,
            isSelected && styles.selectedFilterTabText
          ]}>
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SubjectCard({ subject, isSelected, onPress, index }: {
  subject: Subject;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      
      // Start shimmer animation for selected subjects
      if (isSelected) {
        shimmerPosition.value = withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.linear }),
          -1,
          false
        );
      }
    }, index * 100);
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
    <Animated.View style={[styles.subjectCard, animatedStyle]}>
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected 
            ? [subject.color + '40', subject.color + '20']
            : [theme.colors.background.card, theme.colors.background.secondary]
          }
          style={[styles.subjectCardGradient, isSelected && styles.selectedSubjectCard]}
        >
          <Text style={styles.subjectIcon}>{subject.icon}</Text>
          <Text style={[
            styles.subjectName,
            isSelected && { color: subject.color }
          ]}>
            {subject.name}
          </Text>
          <Text style={styles.subjectCount}>{subject.courseCount} courses</Text>
          
          {/* Shimmer effect for selected subjects */}
          {isSelected && (
            <View style={styles.subjectShimmerContainer}>
              <Animated.View style={[styles.subjectShimmer, shimmerAnimatedStyle]}>
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

function CourseCard({ course, index, onPress }: {
  course: Course;
  index: number;
  onPress: () => void;
}) {
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
      [-width * 1.5, width * 1.5]
    );
    
    return {
      transform: [
        { translateX },
        { rotate: '-30deg' }
      ],
    };
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return theme.colors.accent.green;
      case 'Intermediate': return theme.colors.accent.yellow;
      case 'Advanced': return theme.colors.accent.pink;
      default: return theme.colors.accent.blue;
    }
  };

  return (
    <Animated.View style={[styles.courseCard, animatedStyle]}>
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[
            theme.colors.background.card,
            theme.colors.background.secondary,
          ]}
          style={styles.courseCardGradient}
        >
          <View style={styles.courseImageContainer}>
            <Image source={{ uri: course.image }} style={styles.courseImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.courseImageOverlay}
            />
            <View style={styles.courseSubjectBadge}>
              <Text style={styles.courseSubjectText}>{course.subject}</Text>
            </View>
            <TouchableOpacity style={styles.bookmarkButton}>
              <LinearGradient
                colors={[theme.colors.background.card, theme.colors.background.secondary]}
                style={styles.bookmarkButtonGradient}
              >
                <Bookmark 
                  size={16} 
                  color={course.isBookmarked ? theme.colors.accent.yellow : theme.colors.text.tertiary}
                  fill={course.isBookmarked ? theme.colors.accent.yellow : 'transparent'}
                />
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Shimmer effect for image */}
            <View style={styles.courseImageShimmerContainer}>
              <Animated.View style={[styles.courseImageShimmer, shimmerAnimatedStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          </View>
          
          <View style={styles.courseContent}>
            <View style={styles.courseHeader}>
              <View style={styles.courseTitleContainer}>
                <Text style={styles.courseTitle} numberOfLines={2}>
                  {course.title}
                </Text>
              </View>
              <View style={styles.instructorContainer}>
                <Text style={styles.instructorText}>by {course.instructor}</Text>
              </View>
            </View>

            <Text style={styles.courseDescription} numberOfLines={2}>
              {course.description}
            </Text>

            <View style={styles.courseMetadata}>
              <View style={styles.metadataItem}>
                <Clock size={14} color={theme.colors.text.tertiary} />
                <Text style={styles.metadataText}>{course.duration}</Text>
              </View>
              
              <View style={styles.metadataItem}>
                <Users size={14} color={theme.colors.text.tertiary} />
                <Text style={styles.metadataText}>{course.students.toLocaleString()}</Text>
              </View>
              
              <View style={styles.metadataItem}>
                <Star size={14} color={theme.colors.accent.yellow} fill={theme.colors.accent.yellow} />
                <Text style={[styles.metadataText, { color: theme.colors.accent.yellow }]}>
                  {course.rating}
                </Text>
              </View>
            </View>

            <View style={styles.courseFooter}>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(course.difficulty) + '20' }
              ]}>
                <Text style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(course.difficulty) }
                ]}>
                  {course.difficulty}
                </Text>
              </View>

              {course.progress ? (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={theme.colors.gradient.primary}
                      style={[styles.progressFill, { width: `${course.progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{course.progress}%</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.startButton}>
                  <LinearGradient
                    colors={theme.colors.gradient.primary}
                    style={styles.startButtonGradient}
                  >
                    <Play size={12} color={theme.colors.text.primary} />
                    <Text style={styles.startButtonText}>Start</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Shimmer effect for card */}
          <View style={styles.courseShimmerContainer}>
            <Animated.View style={[styles.courseShimmer, shimmerAnimatedStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.03)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </View>
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
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    gap: theme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  searchShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  searchShimmer: {
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.text.primary,
  },
  filterButton: {
    padding: theme.spacing.sm,
  },
  filtersContainer: {
    marginBottom: theme.spacing.lg,
  },
  filtersScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
  },
  selectedFilterTab: {
    borderColor: theme.colors.accent.purple,
    ...theme.shadows.button,
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
  },
  selectedFilterTabText: {
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.subheading,
  },
  subjectsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.accent.purple,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  subjectCard: {
    width: '30%',
    minWidth: 100,
  },
  subjectCardGradient: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    position: 'relative',
    overflow: 'hidden',
  },
  subjectShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  subjectShimmer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 2,
    height: 200,
    opacity: 0.4,
  },
  selectedSubjectCard: {
    borderColor: theme.colors.accent.purple,
    shadowColor: theme.colors.accent.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  subjectIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  subjectName: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subjectCount: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  featuredContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  featuredCard: {
    borderRadius: theme.spacing.lg,
    overflow: 'hidden',
  },
  featuredGradient: {
    borderRadius: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  featuredShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 3,
  },
  featuredShimmer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 2,
    height: 200,
    opacity: 0.3,
  },
  featuredContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  featuredBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  },
  featuredTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    width: '60%',
  },
  featuredDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    width: '60%',
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  featuredMetaText: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.primary,
  },
  featuredButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  featuredButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  featuredButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  featuredImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coursesContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  coursesList: {
    gap: theme.spacing.lg,
  },
  courseCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  courseCardGradient: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    ...theme.shadows.card,
    position: 'relative',
    overflow: 'hidden',
  },
  courseShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  courseShimmer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 2,
    height: 200,
    opacity: 0.3,
  },
  courseImageContainer: {
    position: 'relative',
    height: 160,
    overflow: 'hidden',
  },
  courseImageShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 2,
  },
  courseImageShimmer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 2,
    height: 200,
    opacity: 0.4,
  },
  courseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  courseImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  courseSubjectBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  courseSubjectText: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.primary,
  },
  bookmarkButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  bookmarkButtonGradient: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  courseContent: {
    padding: theme.spacing.lg,
    position: 'relative',
    zIndex: 2,
  },
  courseHeader: {
    marginBottom: theme.spacing.md,
  },
  courseTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  courseTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorText: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
  },
  courseDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  courseMetadata: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: theme.fonts.caption,
    textTransform: 'uppercase',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressBar: {
    width: 80,
    height: 6,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  progressText: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
  },
  startButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  bottomSpacing: {
    height: 20,
  },
});