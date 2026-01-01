import React from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, commonStyles } from '../../theme';
import Button from '../../components/common/Button';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

import { useEffect, useState } from 'react';
import { getCombinedUserProfile, CombinedUserProfile } from '../../services/userService';

type MentorProfileScreenRouteProp = RouteProp<RootStackParamList, 'MentorProfile'>;
type MentorProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MentorProfile'>;

interface MentorProfileScreenProps {
  route: MentorProfileScreenRouteProp;
  navigation: MentorProfileScreenNavigationProp;
}

const MentorProfileScreen: React.FC<MentorProfileScreenProps> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [mentor, setMentor] = useState<CombinedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMentor = async () => {
      try {
        const profile = await getCombinedUserProfile(userId);
        setMentor(profile);
      } catch (error) {
        console.error('Error loading mentor profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMentor();
  }, [userId]);

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!mentor) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.text }}>Mentor not found</Text>
      </View>
    );
  }

  if (!mentor) {
    return <Text>Mentor not found</Text>;
  }

  const mentorData = mentor.mentorData;

  const handleBookSession = () => {
    // Implement booking logic
    console.log('Book session with', mentor.fullName);
  };

  const handleMessage = () => {
    // Implement messaging logic
    console.log('Message', mentor.fullName);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: mentor.avatar || 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.avatar} />
          </View>
          <Text style={styles.name}>{mentor.fullName}</Text>
          <Text style={styles.role}>{mentor.role}</Text>
          
          <View style={styles.availabilityContainer}>
            <Ionicons 
              name="checkmark-circle" 
              size={16} 
              color={COLORS.success} 
            />
            <Text style={styles.availabilityText}>
              Available for mentoring
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <Button 
              title="Book Session" 
              onPress={handleBookSession} 
              variant="outline"
              style={styles.actionButton}
            />
            <Button 
              title="Message" 
              onPress={handleMessage}
              style={styles.actionButton}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{mentorData?.bio || 'No bio available'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.skillsContainer}>
            {mentorData?.skills && mentorData.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="briefcase" size={20} color={COLORS.primary} style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Experience</Text>
              <Text style={styles.detailText}>{mentorData?.experience || 'Not specified'}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="school" size={20} color={COLORS.primary} style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Education</Text>
              <Text style={styles.detailText} numberOfLines={2}>{mentorData?.education || 'Not specified'}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="location" size={20} color={COLORS.primary} style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>{mentorData?.location || 'Not specified'}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="language" size={20} color={COLORS.primary} style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Languages</Text>
              <Text style={styles.detailText}>{mentorData?.languages?.join(', ') || 'Not specified'}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time" size={20} color={COLORS.primary} style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Availability</Text>
              <Text style={styles.detailText}>{mentorData?.availability || 'Not specified'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://linkedin.com')}
            >
              <Ionicons name="logo-linkedin" size={24} color={COLORS.primary} />
              <Text style={styles.socialButtonText}>LinkedIn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://github.com')}
            >
              <Ionicons name="logo-github" size={24} color={COLORS.primary} />
              <Text style={styles.socialButtonText}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
  availableBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxs,
  },
  role: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingText: {
    marginLeft: SPACING.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  availabilityText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  skillTag: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skillText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  detailIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  socialLinks: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialButtonText: {
    marginLeft: SPACING.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default MentorProfileScreen;
