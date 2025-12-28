import React, { useState } from 'react';
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  PanResponder, 
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, SPACING } from '../../theme';

const { width } = Dimensions.get('window');

type SwipeableCardNavigationProp = StackNavigationProp<RootStackParamList, 'Swipe'>;

type SwipeableCardProps = {
  mentor: any;
  onSwipe: (direction: 'left' | 'right') => void;
  compatibility?: number;
};

const SwipeableCard: React.FC<SwipeableCardProps> = ({ 
  mentor, 
  onSwipe,
  compatibility = 0
}) => {
  const navigation = useNavigation<SwipeableCardNavigationProp>();
  const [pan] = useState(new Animated.ValueXY());

  const handleAvatarPress = () => {
    navigation.navigate('MentorProfile', { userId: mentor.id });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (e, { dx, dy, vx, vy }) => {
      const velocity = vx;
      const threshold = 100;
      
      // Check for swipe direction
      if (velocity < -0.5 || dx < -threshold) {
        // Swipe left
        Animated.timing(pan, {
          toValue: { x: -width, y: dy },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          onSwipe('left');
        });
      } else if (velocity > 0.5 || dx > threshold) {
        // Swipe right
        Animated.timing(pan, {
          toValue: { x: width, y: dy },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          onSwipe('right');
        });
      } else {
        // Spring back to center
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 10,
          tension: 60,
        }).start();
      }
    },
  });

  const rotation = pan.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate: rotation },
    ],
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <Image
        source={{ uri: mentor.photo }}
        style={styles.image}
      />
      <View style={styles.compatibilityBadge}>
        <Text style={styles.compatibilityText}>{compatibility}% Match</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.avatarButton}
        onPress={handleAvatarPress}
      >
        <Image
          source={{ uri: mentor.avatar }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{mentor.name}</Text>
            <Text style={styles.sector}>{mentor.sector}</Text>
          </View>
          <Text style={styles.experience}>{mentor.experience}y exp</Text>
        </View>
        <Text style={styles.bio} numberOfLines={2}>{mentor.bio}</Text>
        <View style={styles.skillsContainer}>
          {mentor.skills.slice(0, 2).map((skill: string, index: number) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}}
        </View>
        <View style={styles.footer}>
          <Text style={styles.location}>📍 {mentor.location}</Text>
          <Text style={styles.languages}>{mentor.languages.join(', ')}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width * 0.88,
    height: 520,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '50%',
    backgroundColor: COLORS.border,
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  compatibilityText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  sector: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  experience: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bio: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  skillTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 11,
    color: COLORS.text,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  languages: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});

export default SwipeableCard;
