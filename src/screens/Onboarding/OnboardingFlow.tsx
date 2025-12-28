import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, SPACING } from '../../theme';
import Button from '../../components/common/Button';
import Text from '../../components/common/Text';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingFlowNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

type OnboardingStepType = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
};

const OnboardingFlow = () => {
  const navigation = useNavigation<OnboardingFlowNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    userType: '',
    goals: '',
    skills: '',
  });

  const steps: OnboardingStepType[] = [
    {
      id: 'welcome',
      title: 'Welcome to MentorMatch',
      subtitle: 'Connect with professionals who can help you grow',
      icon: '🚀',
    },
    {
      id: 'role',
      title: 'Are you a Mentor or Mentee?',
      subtitle: 'Choose your role',
      icon: '👥',
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      subtitle: 'Tell us what you want to achieve',
      icon: '🎯',
    },
    {
      id: 'skills',
      title: 'Your skills',
      subtitle: 'Help us match you better',
      icon: '💡',
    },
  ];

  const updateData = (key: string, value: any) => {
    setUserData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      // Navigate first
      navigation.navigate('Login');
      // Then mark first launch as complete
      await AsyncStorage.setItem('@firstLaunch', 'false');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Icon */}
          <Text style={styles.icon}>{currentStepData.icon}</Text>

          {/* Title */}
          <Text style={styles.title}>{currentStepData.title}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>

          {/* Step Content */}
          {currentStep === 1 && (
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  userData.userType === 'mentor' && styles.roleButtonActive,
                ]}
                onPress={() => updateData('userType', 'mentor')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    userData.userType === 'mentor' && styles.roleButtonTextActive,
                  ]}
                >
                  Mentor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  userData.userType === 'mentee' && styles.roleButtonActive,
                ]}
                onPress={() => updateData('userType', 'mentee')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    userData.userType === 'mentee' && styles.roleButtonTextActive,
                  ]}
                >
                  Mentee
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 2 && (
            <TextInput
              style={styles.textarea}
              placeholder="Learn web development, advance my career..."
              placeholderTextColor={COLORS.textSecondary}
              value={userData.goals}
              onChangeText={(text) => updateData('goals', text)}
              multiline
              numberOfLines={4}
            />
          )}

          {currentStep === 3 && (
            <TextInput
              style={styles.textarea}
              placeholder="JavaScript, Marketing, Leadership..."
              placeholderTextColor={COLORS.textSecondary}
              value={userData.skills}
              onChangeText={(text) => updateData('skills', text)}
              multiline
              numberOfLines={4}
            />
          )}

          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            fullWidth
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    minHeight: 500,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 24,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
    width: '100%',
    justifyContent: 'center',
  },
  roleButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roleButtonActive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: COLORS.primary,
  },
  textarea: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  button: {
    paddingVertical: SPACING.md,
  },
});

export default OnboardingFlow;
