import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, commonStyles } from '../../theme';
import Button from '../../components/common/Button';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  // Temporary user data - will be replaced with actual user data
  const user = {
    name: 'John Doe',
    role: 'Mentor',
    bio: 'Experienced software engineer with 5+ years of experience in React Native and Node.js',
    skills: ['React Native', 'JavaScript', 'TypeScript', 'Node.js'],
    location: 'San Francisco, CA',
    experience: '5 years',
    education: 'B.S. Computer Science',
  };

  const handleLogout = async () => {
    try {
      // Clear auth token
      await AsyncStorage.removeItem('@userToken');
      // Clear first launch flag to show onboarding again
      await AsyncStorage.removeItem('@firstLaunch');
      // Navigate to onboarding
      navigation.navigate('Onboarding');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} 
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="pencil" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
        <Text style={styles.location}>
          <Ionicons name="location" size={16} color={COLORS.primary} /> {user.location}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.bio}>{user.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {user.skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.infoItem}>
          <Ionicons name="briefcase" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>{user.experience} of experience</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="school" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>{user.education}</Text>
        </View>
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
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
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
