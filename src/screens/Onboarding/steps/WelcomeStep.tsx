import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { COLORS, SPACING, commonStyles } from '../../../theme';
import { Text } from '../../../components/common';
import OnboardingStep from '../OnboardingStep';

type WelcomeStepProps = {
  title: string;
  subtitle: string;
};

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ title, subtitle }) => {
  return (
    <OnboardingStep style={styles.container}>
      <Image
        source={require('../../../../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </OnboardingStep>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xxl * 2,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SPACING.xxl,
    borderRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.text,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.xl,
    lineHeight: 24,
  },
});
