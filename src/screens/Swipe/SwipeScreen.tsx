import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../theme';
import SwipeableCard from './SwipeableCard';
import { generateSampleMentors, calculateCompatibility } from './mentorData';

const { width, height } = Dimensions.get('window');

const SwipeScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mentors, setMentors] = useState<any[]>([]);
  const [userRole] = useState<'mentor' | 'mentee'>('mentee');
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    setMentors(generateSampleMentors());
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setMatches([...matches, mentors[currentIndex]]);
    }
    // Update index immediately for better UX
    setCurrentIndex(currentIndex + 1);
  };

  const handleReject = () => {
    handleSwipe('left');
  };

  const handleAccept = () => {
    handleSwipe('right');
  };

  if (mentors.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading mentors...</Text>
      </View>
    );
  }

  if (currentIndex >= mentors.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>No more mentors!</Text>
          <Text style={styles.emptySubtitle}>You've reviewed all available mentors</Text>
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => {
              setCurrentIndex(0);
              setMatches([]);
            }}
          >
            <Text style={styles.restartButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentMentor = mentors[currentIndex];
  const compatibility = calculateCompatibility(userRole, currentMentor);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find your perfect mentor match</Text>
      </View>

      <View style={styles.cardsContainer}>
        {mentors.slice(currentIndex, currentIndex + 2).reverse().map((mentor, index) => (
          <SwipeableCard
            key={`${currentIndex}-${index}`}
            mentor={mentor}
            onSwipe={handleSwipe}
            compatibility={index === 0 ? compatibility : undefined}
          />
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{matches.length}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mentors.length - currentIndex - 1}</Text>
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
