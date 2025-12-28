import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING } from '../../../theme';
import { Text } from '../../../components/common';
import OnboardingStep from '../OnboardingStep';

type Role = 'mentor' | 'mentee';

type RoleSelectionStepProps = {
  onSelectRole: (role: Role) => void;
  selectedRole: Role | null;
};

export const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({
  onSelectRole,
  selectedRole,
}) => {
  const [selected, setSelected] = useState<Role | null>(selectedRole);

  const handleSelectRole = (role: Role) => {
    setSelected(role);
    onSelectRole(role);
  };

  const RoleCard = ({ 
    title, 
    description, 
    role,
    icon,
  }: {
    title: string;
    description: string;
    role: Role;
    icon: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.roleCard,
        selected === role && styles.roleCardSelected,
      ]}
      onPress={() => handleSelectRole(role)}
      activeOpacity={0.8}
    >
      <View style={styles.roleIconContainer}>
        <Text style={styles.roleIcon}>{icon}</Text>
      </View>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleDescription}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <OnboardingStep style={styles.container}>
      <Text style={styles.title}>How would you like to use MentorMatch?</Text>
      <Text style={styles.subtitle}>You can change this later in your profile settings</Text>
      
      <View style={styles.rolesContainer}>
        <RoleCard
          title="I want to be mentored"
          description="Find experienced mentors to guide your learning journey"
          role="mentee"
          icon="👨‍🎓"
        />
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <RoleCard
          title="I want to mentor others"
          description="Share your knowledge and help others grow"
          role="mentor"
          icon="👨‍🏫"
        />
      </View>
    </OnboardingStep>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  rolesContainer: {
    width: '100%',
  },
  roleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  roleIcon: {
    fontSize: 28,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
