import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, SPACING, commonStyles } from '../../theme';
import Button from '../../components/common/Button';

// Using existing icon.png from assets
const MENTOR_IMAGE = require('../../../assets/icon.png');
const MENTEE_IMAGE = require('../../../assets/icon.png');

type RoleSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

const RoleSelectionScreen = ({ onSelectRole, selectedRole: propSelectedRole }: { onSelectRole?: (role: 'mentor' | 'mentee') => void; selectedRole?: string }) => {
  const [selectedRole, setSelectedRole] = useState<'mentor' | 'mentee' | null>(
    (propSelectedRole as 'mentor' | 'mentee') || null
  );
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();

  const handleContinue = () => {
    if (selectedRole) {
      if (onSelectRole) {
        onSelectRole(selectedRole);
      } else {
        // Fallback to navigation if onSelectRole is not provided
        navigation.navigate('Register', { role: selectedRole });
      }
    }
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>I am a...</Text>
        <Text style={styles.subtitle}>Select your role to get started</Text>
      </View>

      <View style={styles.rolesContainer}>
        {/* Mentor Card */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'mentor' && styles.selectedRoleCard,
          ]}
          onPress={() => setSelectedRole('mentor')}
          activeOpacity={0.8}
        >
          <View style={styles.roleImageContainer}>
            <Image source={MENTOR_IMAGE} style={styles.roleImage} resizeMode="contain" />
          </View>
          <Text style={styles.roleTitle}>Mentor</Text>
          <Text style={styles.roleDescription}>
            Share your knowledge and guide others on their journey
          </Text>
          <View style={[styles.radioOuter, selectedRole === 'mentor' && styles.radioOuterSelected]}>
            {selectedRole === 'mentor' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* Mentee Card */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'mentee' && styles.selectedRoleCard,
          ]}
          onPress={() => setSelectedRole('mentee')}
          activeOpacity={0.8}
        >
          <View style={styles.roleImageContainer}>
            <Image source={MENTEE_IMAGE} style={styles.roleImage} resizeMode="contain" />
          </View>
          <Text style={styles.roleTitle}>Mentee</Text>
          <Text style={styles.roleDescription}>
            Find a mentor to guide you in your professional journey
          </Text>
          <View style={[styles.radioOuter, selectedRole === 'mentee' && styles.radioOuterSelected]}>
            {selectedRole === 'mentee' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedRole}
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  rolesContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  roleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRoleCard: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  roleImageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  roleImage: {
    width: 120,
    height: 120,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.mediumGray,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGray,
  },
});

export default RoleSelectionScreen;
