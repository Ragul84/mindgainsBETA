import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Youtube, FileText, Type, Camera, Sparkles, ArrowRight, Upload, Link, CircleCheck as CheckCircle, Zap } from 'lucide-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faYoutube,
  faFileText,
  faKeyboard,
  faCamera,
  faSparkles,
  faArrowRight,
  faUpload,
  faLink,
  faCheckCircle,
  faBolt
} from '@fortawesome/pro-solid-svg-icons';
import { theme } from '@/constants/theme';
import MascotAvatar from '@/components/ui/MascotAvatar';
import GradientButton from '@/components/ui/GradientButton';
import ContentGenerationModal from '@/components/ui/ContentGenerationModal';
import { SupabaseService } from '@/utils/supabaseService';

type InputMethod = 'youtube' | 'pdf' | 'text' | 'camera' | 'smart';

interface InputMethodOption {
  id: InputMethod;
  title: string;
  description: string;
  icon: React.ReactNode;
  colors: string[];
  placeholder: string;
}

const inputMethods: InputMethodOption[] = [
  {
    id: 'text',
    title: 'Enter Topic',
    description: 'Type any topic you want to master',
    icon: <Type size={28} color={theme.colors.text.primary} />,
    colors: [theme.colors.accent.purple, theme.colors.accent.blue],
    placeholder: 'What would you like to master today?',
  },
  {
    id: 'smart',
    title: 'Smart Generator',
    description: 'AI creates exam-focused content',
    icon: <Sparkles size={28} color={theme.colors.text.primary} />,
    colors: [theme.colors.accent.yellow, theme.colors.accent.green],
    placeholder: 'AI will generate structured content...',
  },
  {
    id: 'youtube',
    title: 'YouTube Video',
    description: 'Learn from educational videos',
    icon: <Youtube size={28} color={theme.colors.text.primary} />,
    colors: [theme.colors.accent.pink, theme.colors.accent.purple],
    placeholder: 'Paste YouTube video URL here...',
  },
  {
    id: 'pdf',
    title: 'Upload Document',
    description: 'Upload study materials',
    icon: <FileText size={28} color={theme.colors.text.primary} />,
    colors: [theme.colors.accent.blue, theme.colors.accent.cyan],
    placeholder: 'Select file to upload...',
  },
];

export default function CreateScreen() {
  const [selectedMethod, setSelectedMethod] = useState<InputMethod | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdMissionId, setCreatedMissionId] = useState<string | null>(null);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  
  const mascotScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const inputGlow = useSharedValue(0);
  const buttonPulse = useSharedValue(1);
  const successScale = useSharedValue(0);

  React.useEffect(() => {
    if (selectedMethod && inputValue.trim() && title.trim()) {
      buttonPulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    }
  }, [selectedMethod, inputValue, title]);

  const handleMethodSelect = (method: InputMethod) => {
    if (method === 'smart') {
      setShowGenerationModal(true);
      return;
    }

    setSelectedMethod(method);
    setInputValue('');
    formOpacity.value = withTiming(1, { duration: 400 });
    mascotScale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 15, stiffness: 120 })
    );
  };

  const handleSmartGeneration = async (config: any) => {
    setIsLoading(true);
    
    try {
      const missionData = {
        title: config.topic,
        description: `AI-generated ${config.contentType} content for ${config.examFocus.toUpperCase()} exam preparation`,
        content_type: 'text' as const,
        content_text: config.topic,
        subject_name: config.subject || getSubjectFromContentType(config.contentType),
        difficulty: 'medium' as const,
        contentType: config.contentType,
        examFocus: config.examFocus,
      };

      console.log('Creating smart mission with data:', missionData);
      const result = await SupabaseService.createMission(missionData);
      console.log('Smart mission creation result:', result);

      if (result.success && result.mission) {
        setCreatedMissionId(result.mission.id);
        setIsSuccess(true);
        successScale.value = withSpring(1, { damping: 12, stiffness: 100 });
        
        // Navigate to mission after delay
        setTimeout(() => {
          router.push({
            pathname: '/mission/clarity',
            params: {
              missionId: result.mission.id,
            },
          });
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to create mission');
      }
    } catch (error) {
      console.error('Error creating smart mission:', error);
      Alert.alert(
        'Error',
        'Failed to create mission. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectFromContentType = (contentType: string): string => {
    const subjectMap: Record<string, string> = {
      historical_period: 'History',
      constitution: 'Polity',
      geography: 'Geography',
      science: 'Science',
      literature: 'Literature',
      general: 'General Studies'
    };
    return subjectMap[contentType] || 'General Studies';
  };

  const handleInputFocus = () => {
    inputGlow.value = withSpring(1);
  };

  const handleInputBlur = () => {
    inputGlow.value = withSpring(0);
  };

  const validateYouTubeURL = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleCreateMission = async () => {
    if (!selectedMethod || !inputValue.trim() || !title.trim()) {
      Alert.alert(
        'Missing Information',
        'Please provide a title and content for your mission!'
      );
      return;
    }

    // Validate YouTube URL if selected
    if (selectedMethod === 'youtube' && !validateYouTubeURL(inputValue)) {
      Alert.alert(
        'Invalid URL',
        'Please enter a valid YouTube URL'
      );
      return;
    }

    setIsLoading(true);

    try {
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
        router.replace('/auth');
        return;
      }

      const missionData = {
        title: title.trim(),
        description: `AI-powered learning mission: ${title}`,
        content_type: selectedMethod,
        content_url: selectedMethod === 'youtube' ? inputValue : undefined,
        content_text: selectedMethod === 'text' ? inputValue : title,
        subject_name: subject.trim() || undefined,
        difficulty: 'medium' as const,
      };

      console.log('Creating mission with data:', missionData);
      const result = await SupabaseService.createMission(missionData);
      console.log('Mission creation result:', result);

      if (result.success && result.mission) {
        setCreatedMissionId(result.mission.id);
        setIsSuccess(true);
        successScale.value = withSpring(1, { damping: 12, stiffness: 100 });
        
        // Track mission creation
        await SupabaseService.trackUserActivity(user.id, 'mission_created', {
          missionId: result.mission.id,
          contentType: selectedMethod,
          title: title.trim()
        });
        
        // Navigate to mission after delay
        setTimeout(() => {
          router.push({
            pathname: '/mission/clarity',
            params: {
              missionId: result.mission.id,
            },
          });
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to create mission');
      }
    } catch (error) {
      console.error('Error creating mission:', error);
      Alert.alert(
        'Error',
        'Failed to create mission. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    Alert.alert('File Upload', 'File upload functionality coming soon!');
  };

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: (1 - formOpacity.value) * 20 }],
  }));

  const inputGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: inputGlow.value * 0.3,
    shadowRadius: inputGlow.value * 12,
    shadowColor: theme.colors.accent.purple,
    borderColor: inputGlow.value > 0 ? theme.colors.accent.purple : theme.colors.border.tertiary,
  }));

  const buttonPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonPulse.value }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  const getMascotMessage = () => {
    if (isSuccess) {
      return "Mission created successfully! Let's start learning! 🚀";
    }
    
    if (isLoading) {
      return "Creating your AI-powered learning mission... 🤖";
    }
    
    if (!selectedMethod) {
      return "What would you like to master for your exams today? 🎯";
    }
    
    switch (selectedMethod) {
      case 'smart':
        return "Smart choice! I'll create exam-focused content! 🎯";
      case 'youtube':
        return "Great! I'll extract key insights from the video. 📺";
      case 'pdf':
        return "Perfect! I'll analyze your document thoroughly. 📄";
      case 'text':
        return "Excellent! Tell me what you want to master. ✍️";
      default:
        return "Let's create an amazing learning experience! 🌟";
    }
  };

  const selectedMethodData = selectedMethod ? inputMethods.find(m => m.id === selectedMethod) : null;

  if (isSuccess) {
    return (
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.secondary,
          theme.colors.background.tertiary,
        ]}
        style={styles.container}
      >
        <View style={styles.successContainer}>
          <Animated.View style={[styles.successContent, successAnimatedStyle]}>
            <MascotAvatar
              size={120}
              animated={true}
              glowing={true}
              mood="celebrating"
            />
            
            <LinearGradient
              colors={[theme.colors.accent.green, theme.colors.accent.cyan]}
              style={styles.successBadge}
            >
              <CheckCircle size={32} color={theme.colors.text.primary} />
              <Text style={styles.successTitle}>Mission Created!</Text>
            </LinearGradient>
            
            <Text style={styles.successMessage}>
              Your AI-powered learning mission is ready. Get ready for an amazing learning experience!
            </Text>
            
            <Text style={styles.successSubMessage}>
              You'll go through 4 learning rooms: Clarity → Quiz → Memory → Test
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[
        theme.colors.background.primary,
        theme.colors.background.secondary,
        theme.colors.background.tertiary,
      ]}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Mission</Text>
          <Text style={styles.headerSubtitle}>Master any topic with AI-powered learning</Text>
        </View>

        {/* Mascot Section */}
        <View style={styles.mascotSection}>
          <Animated.View style={mascotAnimatedStyle}>
            <MascotAvatar
              size={100}
              animated={true}
              glowing={true}
              mood={isLoading ? 'focused' : selectedMethod ? 'excited' : 'happy'}
            />
          </Animated.View>
          
          <LinearGradient
            colors={[theme.colors.background.card, theme.colors.background.secondary]}
            style={styles.speechBubble}
          >
            <Text style={styles.speechText}>{getMascotMessage()}</Text>
          </LinearGradient>
        </View>

        {/* Method Selection */}
        <View style={styles.methodsContainer}>
          <Text style={styles.sectionTitle}>Choose Your Learning Source</Text>
          
          <View style={styles.methodsGrid}>
            {inputMethods.map((method, index) => (
              <MethodCard
                key={method.id}
                method={method}
                isSelected={selectedMethod === method.id}
                onSelect={() => handleMethodSelect(method.id)}
                index={index}
              />
            ))}
          </View>
        </View>

        {/* Input Form */}
        {selectedMethod && selectedMethod !== 'smart' && (
          <Animated.View style={[styles.inputForm, formAnimatedStyle]}>
            <LinearGradient
              colors={[
                theme.colors.background.card,
                theme.colors.background.secondary,
              ]}
              style={styles.formCard}
            >
              <View style={styles.formHeader}>
                <View style={styles.formTitleContainer}>
                  {selectedMethodData?.icon}
                  <Text style={styles.formTitle}>{selectedMethodData?.title}</Text>
                </View>
                <Text style={styles.formDescription}>{selectedMethodData?.description}</Text>
              </View>
              
              {/* Mission Title */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mission Title *</Text>
                <Animated.View style={[styles.textInputContainer, inputGlowStyle]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Give your mission a catchy title..."
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={title}
                    onChangeText={setTitle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </Animated.View>
              </View>

              {/* Subject Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Subject (Optional)</Text>
                <Animated.View style={[styles.textInputContainer, inputGlowStyle]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Physics, History, Mathematics..."
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={subject}
                    onChangeText={setSubject}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </Animated.View>
              </View>

              {/* Main Content Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Content *</Text>
                
                {selectedMethod === 'pdf' ? (
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={handleFileUpload}
                  >
                    <LinearGradient
                      colors={selectedMethodData?.colors || theme.colors.gradient.primary}
                      style={styles.uploadGradient}
                    >
                      <Upload size={20} color={theme.colors.text.primary} />
                      <Text style={styles.uploadText}>Choose File</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <Animated.View style={[styles.textInputContainer, inputGlowStyle]}>
                    {selectedMethod === 'youtube' && (
                      <View style={styles.inputIcon}>
                        <Link size={20} color={theme.colors.text.tertiary} />
                      </View>
                    )}
                    <TextInput
                      style={[
                        styles.textInput,
                        selectedMethod === 'text' && styles.multilineInput,
                        selectedMethod === 'youtube' && styles.urlInput,
                      ]}
                      placeholder={selectedMethodData?.placeholder}
                      placeholderTextColor={theme.colors.text.tertiary}
                      value={inputValue}
                      onChangeText={setInputValue}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      multiline={selectedMethod === 'text'}
                      numberOfLines={selectedMethod === 'text' ? 4 : 1}
                      keyboardType={selectedMethod === 'youtube' ? 'url' : 'default'}
                      autoCapitalize={selectedMethod === 'youtube' ? 'none' : 'sentences'}
                    />
                  </Animated.View>
                )}
              </View>

              {/* Create Button */}
              <Animated.View style={buttonPulseStyle}>
                <GradientButton
                  title={isLoading ? "Creating Mission..." : "Create Learning Mission"}
                  onPress={handleCreateMission}
                  size="large"
                  fullWidth
                  disabled={isLoading || !inputValue.trim() || !title.trim()}
                  icon={isLoading ? undefined : <ArrowRight size={20} color={theme.colors.text.primary} />}
                  colors={selectedMethodData?.colors || theme.colors.gradient.primary}
                  style={styles.createButton}
                />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Content Generation Modal */}
      <ContentGenerationModal
        visible={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        onGenerate={handleSmartGeneration}
      />
    </LinearGradient>
  );
}

function MethodCard({ method, isSelected, onSelect, index }: {
  method: InputMethodOption;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, index * 150);
  }, [index]);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    onSelect();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.methodButton, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isSelected
              ? method.colors
              : [
                  theme.colors.background.card,
                  theme.colors.background.secondary,
                ]
          }
          style={[
            styles.methodCard,
            isSelected && styles.selectedMethod,
            method.id === 'smart' && styles.smartMethodCard,
          ]}
        >
          <View style={styles.methodIcon}>
            {method.icon}
          </View>
          <Text
            style={[
              styles.methodTitle,
              isSelected && styles.selectedMethodText,
              method.id === 'smart' && styles.smartMethodTitle,
            ]}
          >
            {method.title}
          </Text>
          <Text
            style={[
              styles.methodDescription,
              isSelected && styles.selectedMethodText,
            ]}
          >
            {method.description}
          </Text>
          
          {method.id === 'smart' && (
            <View style={styles.smartBadge}>
              <Zap size={12} color={theme.colors.accent.yellow} />
              <Text style={styles.smartBadgeText}>AI</Text>
            </View>
          )}
          
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <LinearGradient
                colors={['#ffffff40', '#ffffff60']}
                style={styles.selectedIndicatorGradient}
              >
                <Sparkles size={16} color={theme.colors.text.primary} />
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  mascotSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    position: 'relative',
  },
  speechBubble: {
    position: 'absolute',
    top: 80,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    maxWidth: 300,
    ...theme.shadows.card,
  },
  speechText: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  methodsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  methodButton: {
    width: '45%',
  },
  methodCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    minHeight: 160,
    borderWidth: 1,
    borderColor: theme.colors.border.tertiary,
    position: 'relative',
  },
  smartMethodCard: {
    borderWidth: 2,
    borderColor: theme.colors.accent.yellow + '60',
    ...theme.shadows.card,
  },
  selectedMethod: {
    borderColor: theme.colors.border.primary,
    ...theme.shadows.card,
  },
  methodIcon: {
    marginBottom: theme.spacing.md,
  },
  methodTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  smartMethodTitle: {
    color: theme.colors.accent.yellow,
  },
  methodDescription: {
    fontSize: 12,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedMethodText: {
    color: theme.colors.text.primary,
  },
  smartBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent.yellow + '20',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    gap: 2,
  },
  smartBadgeText: {
    fontSize: 8,
    fontFamily: theme.fonts.caption,
    color: theme.colors.accent.yellow,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  selectedIndicatorGradient: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  inputForm: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  formCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.card,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  formTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
  },
  formDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  textInputContainer: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.tertiary,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    paddingLeft: theme.spacing.md,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.text.primary,
    minHeight: 48,
  },
  urlInput: {
    paddingLeft: theme.spacing.sm,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  uploadButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: theme.fonts.subheading,
    color: theme.colors.text.primary,
  },
  createButton: {
    marginTop: theme.spacing.md,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  successContent: {
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text.primary,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  successSubMessage: {
    fontSize: 14,
    fontFamily: theme.fonts.caption,
    color: theme.colors.accent.purple,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});