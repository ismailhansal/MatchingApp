import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, SPACING, commonStyles } from '../../theme';
import Button from '../../components/common/Button';
import OnboardingStep from '../../components/onboarding/OnboardingStep';
import { SafeAreaView } from 'react-native-safe-area-context';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: '1',
    title: 'Welcome to MentorMatch',
    description: 'Connect with experienced mentors who can guide you on your professional journey.',
    image: { uri: 'https://picsum.photos/400/400?random=1' },
  },
  {
    id: '2',
    title: 'Find Your Perfect Match',
    description: 'Swipe right to connect with mentors who match your goals and interests.',
    image: { uri: 'https://picsum.photos/400/400?random=2' },
  },
  {
    id: '3',
    title: 'Grow Together',
    description: 'Build meaningful connections and achieve your career aspirations with expert guidance.',
    image: { uri: 'https://picsum.photos/400/400?random=3' },
  },
];

const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to the next screen (e.g., role selection or auth)
      navigation.navigate('Auth');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Skip button */}
      <Button 
        title="Skip" 
        variant="text" 
        onPress={handleSkip} 
        style={styles.skipButton}
        textStyle={styles.skipButtonText}
      />

      {/* Step indicators */}
      <View style={styles.stepIndicatorContainer}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.stepIndicator, 
              index === currentStep && styles.activeStepIndicator
            ]} 
          />
        ))}
      </View>

      {/* Scrollable content */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const newStep = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentStep(newStep);
        }}
        style={styles.scrollView}
      >
        {ONBOARDING_STEPS.map((step) => (
          <View key={step.id} style={styles.slide}>
            <Image source={step.image} style={styles.image} resizeMode="contain" />
            <OnboardingStep 
              title={step.title} 
              description={step.description} 
            />
          </View>
        ))}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        <Button 
          title={currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'} 
          onPress={handleNext}
          fullWidth
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  skipButton: {
    alignSelf: 'flex-end',
    marginRight: SPACING.md,
    marginTop: SPACING.sm,
  },
  skipButtonText: {
    color: COLORS.textTertiary,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.darkGray,
    marginHorizontal: 4,
  },
  activeStepIndicator: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width - SPACING.md * 2,
    marginHorizontal: SPACING.md,
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },
  image: {
    width: width - SPACING.xl * 2,
    height: width * 0.7,
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  nextButton: {
    marginTop: SPACING.lg,
  },
});

export default OnboardingScreen;
