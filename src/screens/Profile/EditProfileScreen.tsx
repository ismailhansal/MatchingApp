import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Text, Image, Switch, Picker } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, commonStyles } from '../../theme';
import Button from '../../components/common/Button';

const EditProfileScreen = () => {
  const [name, setName] = useState('John Doe');
  const [bio, setBio] = useState('Experienced software engineer with 5+ years of experience');
  const [location, setLocation] = useState('San Francisco, CA');
  const [experience, setExperience] = useState('5 years');
  const [education, setEducation] = useState('B.S. Computer Science');
  const [skills, setSkills] = useState('React Native, JavaScript, TypeScript, Node.js');
  const [role, setRole] = useState('mentor');
  const [sector, setSector] = useState('Technology');
  const [languages, setLanguages] = useState('English, Spanish, Mandarin');
  const [hourlyRate, setHourlyRate] = useState('50');
  const [availability, setAvailability] = useState('weekends');
  const [isPublic, setIsPublic] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    console.log('Saving profile...', {
      name, bio, location, experience, education, skills, role, sector, languages, hourlyRate, availability, isPublic, notifications
    });
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }} 
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editPhotoButton}>
            <Ionicons name="camera" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Personal Info</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="City, Country"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Professional</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'mentor' && styles.roleButtonActive]}
              onPress={() => setRole('mentor')}
            >
              <Text style={[styles.roleButtonText, role === 'mentor' && styles.roleButtonTextActive]}>Mentor</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'mentee' && styles.roleButtonActive]}
              onPress={() => setRole('mentee')}
            >
              <Text style={[styles.roleButtonText, role === 'mentee' && styles.roleButtonTextActive]}>Mentee</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Sector</Text>
          <TextInput
            style={styles.input}
            value={sector}
            onChangeText={setSector}
            placeholder="e.g., Technology, Finance, Healthcare"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Experience</Text>
          <TextInput
            style={styles.input}
            value={experience}
            onChangeText={setExperience}
            placeholder="e.g., 5 years"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Education</Text>
          <TextInput
            style={styles.input}
            value={education}
            onChangeText={setEducation}
            placeholder="Your education"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Skills (comma separated)</Text>
          <TextInput
            style={[styles.input, styles.skillsInput]}
            value={skills}
            onChangeText={setSkills}
            placeholder="e.g., React, JavaScript, UI/UX"
            placeholderTextColor={COLORS.textTertiary}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Languages</Text>
          <TextInput
            style={styles.input}
            value={languages}
            onChangeText={setLanguages}
            placeholder="e.g., English, Spanish, Mandarin"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        {role === 'mentor' && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hourly Rate (USD)</Text>
              <TextInput
                style={styles.input}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="50"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Availability</Text>
              <View style={styles.availabilityContainer}>
                {['weekdays', 'weekends', 'anytime'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.availabilityButton,
                      availability === option && styles.availabilityButtonActive
                    ]}
                    onPress={() => setAvailability(option)}
                  >
                    <Text style={[
                      styles.availabilityButtonText,
                      availability === option && styles.availabilityButtonTextActive
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Settings</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name="eye" size={20} color={COLORS.primary} />
            <Text style={styles.settingText}>Public Profile</Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={isPublic ? COLORS.primary : COLORS.textTertiary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Ionicons name="notifications" size={20} color={COLORS.primary} />
            <Text style={styles.settingText}>Enable Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={notifications ? COLORS.primary : COLORS.textTertiary}
          />
        </View>

        <Button 
          title="Save Changes" 
          onPress={handleSave} 
          fullWidth 
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 10,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  sectionTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  skillsInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  roleButtonTextActive: {
    color: COLORS.text,
  },
  availabilityContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  availabilityButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  availabilityButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  availabilityButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  availabilityButtonTextActive: {
    color: COLORS.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  settingText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
});

export default EditProfileScreen;
