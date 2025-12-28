import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, commonStyles } from '../../theme';

// Mock data for feed posts
const mockPosts = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'Senior Developer',
    },
    content: 'Just published a new article about React Native performance optimization! Check it out and let me know your thoughts. #ReactNative #MobileDev',
    image: 'https://miro.medium.com/max/1400/1*LGHh60wmYDbEFMqKxUEBzA.png',
    likes: 24,
    comments: 8,
    timeAgo: '2h ago',
    isLiked: false,
  },
  {
    id: '2',
    user: {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      role: 'UX/UI Designer',
    },
    content: 'Designing for accessibility isn\'t just about checking boxes—it\'s about creating experiences that everyone can use and enjoy. Here are some key principles to keep in mind:',
    image: 'https://miro.medium.com/max/1400/1*2J9E1pYtZJYtJh5J5X5Q5Q.png',
    likes: 42,
    comments: 15,
    timeAgo: '5h ago',
    isLiked: true,
  },
  {
    id: '3',
    user: {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      role: 'Product Manager',
    },
    content: 'Excited to announce that our team just launched a major update to our mobile app! Huge thanks to everyone who contributed to this release. #ProductLaunch #TeamWork',
    image: null,
    likes: 56,
    comments: 12,
    timeAgo: '1d ago',
    isLiked: false,
  },
];

const FeedScreen = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeCommentInput, setActiveCommentInput] = useState<string | null>(null);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    
    // In a real app, you would send this to your backend
    console.log(`Adding comment to post ${postId}: ${commentText}`);
    
    // For demo purposes, we'll just close the comment input
    setCommentText('');
    setActiveCommentInput(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderPost = ({ item }: { item: typeof mockPosts[0] }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.userRole}>{item.user.role} • {item.timeAgo}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Ionicons 
            name="heart" 
            size={16} 
            color={COLORS.primary} 
            style={styles.statIcon} 
          />
          <Text style={styles.statText}>{item.likes}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>{item.comments} comments</Text>
        </View>
      </View>
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? 'heart' : 'heart-outline'} 
            size={24} 
            color={item.isLiked ? COLORS.primary : COLORS.textTertiary} 
          />
          <Text style={[
            styles.actionText,
            item.isLiked && styles.actionTextActive
          ]}>
            Like
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setActiveCommentInput(activeCommentInput === item.id ? null : item.id)}
        >
          <Ionicons 
            name="chatbubble-outline" 
            size={22} 
            color={activeCommentInput === item.id ? COLORS.primary : COLORS.textTertiary} 
          />
          <Text style={[
            styles.actionText,
            activeCommentInput === item.id && styles.actionTextActive
          ]}>
            Comment
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={22} color={COLORS.textTertiary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
      
      {activeCommentInput === item.id && (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor={COLORS.textTertiary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity 
            style={styles.commentButton}
            onPress={() => handleAddComment(item.id)}
            disabled={!commentText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={commentText.trim() ? COLORS.primary : COLORS.textTertiary} 
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...commonStyles.shadow,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  menuButton: {
    padding: SPACING.xs,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  postStats: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  actionText: {
    marginLeft: SPACING.xs,
    color: COLORS.textTertiary,
    fontSize: 14,
    fontWeight: '500',
  },
  actionTextActive: {
    color: COLORS.primary,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginTop: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    color: COLORS.text,
    maxHeight: 100,
    padding: SPACING.xs,
  },
  commentButton: {
    padding: SPACING.xs,
  },
});

export default FeedScreen;
