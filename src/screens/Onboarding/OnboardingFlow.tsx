import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, SPACING } from '../../theme';
import Button from '../../components/common/Button';
import Text from '../../components/common/Text';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getDefaultAvatarUrl } from '../../services/imageService';
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
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: '',
    goals: '',
    skills: '',
  });
  const [error, setError] = useState<string | null>(null);

  const steps: OnboardingStepType[] = [
    {
      id: 'email',
      title: 'Create Your Account',
      subtitle: 'Enter your email and password',
      icon: '📧',
    },
    {
      id: 'name',
      title: 'What\'s your name?',
      subtitle: 'We\'d love to know who you are',
      icon: '👤',
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
    setError(null);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Email & Password
        if (!userData.email.trim()) {
          setError('Please enter your email');
          return false;
        }
        if (!validateEmail(userData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!userData.password) {
          setError('Please enter a password');
          return false;
        }
        if (userData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        if (userData.password !== userData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
      case 1: // Full Name
        if (!userData.fullName.trim()) {
          setError('Please enter your full name');
          return false;
        }
        if (userData.fullName.trim().length < 2) {
          setError('Please enter a valid name');
          return false;
        }
        return true;
      case 2: // Role
        if (!userData.userType) {
          setError('Please select your role');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and create account
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (isCreatingAccount) return;

    setIsCreatingAccount(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email.trim(),
        userData.password
      );
      const user = userCredential.user;

      // Create global user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        fullName: userData.fullName.trim(),
        role: userData.userType,
        createdAt: new Date().toISOString(),
        isPublic: true,
        avatar: getDefaultAvatarUrl(user.uid),
      });

      // Create role-specific profile document
      const collectionName = userData.userType === 'mentor' ? 'mentors' : 'mentees';
      await setDoc(doc(db, collectionName, user.uid), {
        bio: '',
        skills: userData.skills ? userData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
        location: '',
        experience: '',
        education: '',
        languages: [],
        availability: 'anytime',
        ...(userData.userType === 'mentor' && { hourlyRate: 0 }),
      });

      // Set flag to show profile completion reminder after 5 seconds
      await AsyncStorage.setItem(`newAccount_${user.uid}`, 'true');

      // User is now authenticated
      // DO NOT navigate here - let the AppNavigator's onAuthStateChanged listener handle it
      // This prevents double navigation and race conditions
      // The auth state change will automatically trigger navigation to Main
      
      console.log('Account created successfully, auth state will trigger navigation');
    } catch (error: any) {
      console.error('Error creating account:', error);
      let errorMessage = 'An error occurred while creating your account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      setError(errorMessage);
    } finally {
      setIsCreatingAccount(false);
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
        {currentStep === 0 && (
          <View style={styles.formContainer}>
            {/* Email Input */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textTertiary}
              value={userData.email}
              onChangeText={(text) => updateData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password Input */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor={COLORS.textTertiary}
                value={userData.password}
                onChangeText={(text) => updateData('password', text)}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.visibilityToggle}
              >
                <Text style={styles.visibilityText}>
                  {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={COLORS.textTertiary}
              value={userData.confirmPassword}
              onChangeText={(text) => updateData('confirmPassword', text)}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
            />
          </View>
        )}

        {currentStep === 1 && (
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor={COLORS.textTertiary}
            value={userData.fullName}
            onChangeText={(text) => updateData('fullName', text)}
            autoCapitalize="words"
          />
        )}

        {currentStep === 2 && (
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

        {currentStep === 3 && (
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

        {currentStep === 4 && (
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

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
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
            title={
              isCreatingAccount
                ? 'Creating Account...'
                : currentStep === steps.length - 1
                ? 'Create Account'
                : 'Next'
            }
            onPress={handleNext}
            fullWidth
            style={styles.button}
            disabled={isCreatingAccount}
            loading={isCreatingAccount}
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
  formContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
  },
  visibilityToggle: {
    padding: SPACING.sm,
  },
  visibilityText: {
    fontSize: 18,
  },
  errorContainer: {
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
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
