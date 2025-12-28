import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../theme';
import Text from '../../components/common/Text';

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
};

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.stepText}>
        Step {currentStep} of {totalSteps}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.sm,
    fontFamily: 'Inter-Medium',
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});

export default OnboardingProgress;
