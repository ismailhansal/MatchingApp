import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../theme';
import SwipeableCard from './SwipeableCard';
import { getDiscoverUsers, recordSwipe, filterOutMatched } from '../../services/swipeService';
import { getUserProfile } from '../../services/userService';
import { useAuthState } from '../../hooks/useAuthState';

const { width, height } = Dimensions.get('window');

const SwipeScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState();

  useEffect(() => {
    loadDiscoverProfiles();
  }, [user]);

  const loadDiscoverProfiles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get current user's role
      const currentUserProfile = await getUserProfile(user.uid);
      if (!currentUserProfile) {
        console.error('Could not find current user profile');
        return;
      }

      // Fetch all users of opposite role
      const allProfiles = await getDiscoverUsers(user.uid, currentUserProfile.role);
      
      // Filter out already matched profiles
      const filteredProfiles = await filterOutMatched(allProfiles, user.uid);
      
      setProfiles(filteredProfiles);
    } catch (error) {
      console.error('Error loading discover profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || profiles.length === 0) return;

    try {
      console.log(`User ${user.uid} swiping ${direction} on ${profiles[currentIndex].id}`);
      
      // Record swipe in Firebase
      await recordSwipe(user.uid, profiles[currentIndex].id, direction);
      
      // Move to next profile
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Error recording swipe:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  const handleReject = () => {
    handleSwipe('left');
  };

  const handleAccept = () => {
    handleSwipe('right');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>No more profiles!</Text>
          <Text style={styles.emptySubtitle}>You've reviewed all available matches</Text>
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={loadDiscoverProfiles}
          >
            <Text style={styles.restartButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>No more profiles!</Text>
          <Text style={styles.emptySubtitle}>You've reviewed all available matches</Text>
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={loadDiscoverProfiles}
          >
            <Text style={styles.restartButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find your perfect match</Text>
      </View>

      <View style={styles.cardsContainer}>
        {profiles.slice(currentIndex, currentIndex + 2).reverse().map((profile, index) => (
          <SwipeableCard
            key={`${currentIndex}-${index}`}
            mentor={profile}
            onSwipe={handleSwipe}
          />
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profiles.length - currentIndex - 1}</Text>
          <Text style={styles.statLabel}>Left</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'flex-start',
    paddingTop: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minHeight: 500,
    width: '100%',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  restartButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  restartButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  text: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '600',
  },
});

export default SwipeScreen;
