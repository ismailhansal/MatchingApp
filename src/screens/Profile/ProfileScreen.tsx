import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, commonStyles } from '../../theme';
import Button from '../../components/common/Button';
import { RootStackParamList } from '../../navigation/AppNavigator';

import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuthState } from '../../hooks/useAuthState';
import { useProfileCompletion } from '../../hooks/useProfileCompletion';
import { getCombinedUserProfile, CombinedUserProfile, MentorProfile, MenteeProfile } from '../../services/userService';
import { getDefaultAvatarUrl } from '../../services/imageService';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [authUser, loading] = useAuthState();
  const [userProfile, setUserProfile] = useState<CombinedUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Show profile completion reminder 5 seconds after account creation
  useProfileCompletion();

  const loadProfile = useCallback(async () => {
    if (!authUser) {
      setProfileLoading(false);
      return;
    }

    try {
      const profile = await getCombinedUserProfile(authUser.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    loadProfile();
  }, [authUser, loadProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigation will happen automatically via useAuthState listener
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading || profileLoading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!authUser || !userProfile) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.text }}>Unable to load profile</Text>
      </View>
    );
  }

  // Get role-specific data
  const roleData = userProfile.role === 'mentor' ? userProfile.mentorData : userProfile.menteeData;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          progressBackgroundColor={COLORS.surface}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: userProfile.avatar || getDefaultAvatarUrl(authUser.uid) }} 
            style={styles.avatar}
          />
          <TouchableOpacity 
            style={styles.editIcon}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{userProfile.fullName}</Text>
        <Text style={styles.role}>{userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}</Text>
        {roleData?.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.location}>{roleData.location}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.bio}>{roleData?.bio || 'No bio available'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {roleData?.skills && roleData.skills.length > 0 ? (
            roleData.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.bio}>No skills added yet</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {roleData?.experience && (
          <View style={styles.infoItem}>
            <Ionicons name="briefcase" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{roleData.experience}</Text>
          </View>
        )}
        {roleData?.education && (
          <View style={styles.infoItem}>
            <Ionicons name="school" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{roleData.education}</Text>
          </View>
        )}
        {!roleData?.experience && !roleData?.education && (
          <Text style={styles.bio}>No experience or education added yet</Text>
        )}
      </View>

      <View style={styles.actions}>
        <Button 
          title="Edit Profile" 
          onPress={() => navigation.navigate('EditProfile')} 
          variant="outline"
          fullWidth
          style={styles.button}
        />
        <Button 
          title="Settings" 
          onPress={() => navigation.navigate('Settings' as any)} 
          variant="outline"
          fullWidth
          style={styles.button}
        />
        <Button 
          title="Logout" 
          onPress={handleLogout}
          fullWidth
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  role: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  skillTag: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skillText: {
    color: COLORS.text,
    fontSize: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  actions: {
    padding: SPACING.lg,
  },
  button: {
    marginBottom: SPACING.md,
  },
  logoutButton: {
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
  },
});

export default ProfileScreen;
