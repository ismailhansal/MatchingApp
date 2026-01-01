import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  Image, 
  ListRenderItem,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, commonStyles } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuthState } from '../../hooks/useAuthState';
import { subscribeToUserConversations, Conversation, getOtherParticipant } from '../../services/chatService';
import { getUserMatches } from '../../services/swipeService';
import { getUserProfile } from '../../services/userService';

type ChatListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatList'>;

interface ChatItem {
  conversationId: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isOnline: boolean;
}

interface ChatListScreenProps {
  navigation: ChatListScreenNavigationProp;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const [authUser, loading] = useAuthState();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [matchedProfiles, setMatchedProfiles] = useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setConversationsLoading(false);
      return;
    }

    setConversationsLoading(true);
    const unsubscribe = subscribeToUserConversations(authUser.uid, (conversations: Conversation[]) => {
      const chatItems: ChatItem[] = conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation, authUser.uid);
        
        return {
          conversationId: conversation.id,
          name: otherParticipant?.name || 'Unknown User',
          lastMessage: conversation.lastMessage || 'No messages yet',
          time: formatTime(conversation.lastMessageTime),
          unread: conversation.unreadCount,
          avatar: otherParticipant?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          isOnline: true, // TODO: Implement online status
        };
      });
      
      setChats(chatItems);
      setConversationsLoading(false);
    });

    return () => unsubscribe();
  }, [authUser]);

  // Load matched profiles
  useEffect(() => {
    if (!authUser) {
      setMatchesLoading(false);
      return;
    }

    const loadMatches = async () => {
      try {
        setMatchesLoading(true);
        const matches = await getUserMatches(authUser.uid);
        
        // Get profiles for matched users
        const matchedProfilesData = await Promise.all(
          matches.map(async (match) => {
            const otherUserId = match.mentorId === authUser.uid ? match.menteeId : match.mentorId;
            const profile = await getUserProfile(otherUserId);
            return {
              id: otherUserId,
              name: profile?.fullName || 'User',
              avatar: profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
            };
          })
        );
        
        setMatchedProfiles(matchedProfilesData);
      } catch (error) {
        console.error('Error loading matched profiles:', error);
      } finally {
        setMatchesLoading(false);
      }
    };

    loadMatches();
  }, [authUser]);

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderChatItem: ListRenderItem<ChatItem> = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { 
        chatId: item.conversationId,
        recipientId: item.conversationId,
        recipientName: item.name
      })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.chatPreview}>
          <Text 
            style={[
              styles.lastMessage, 
              item.unread > 0 && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading || conversationsLoading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Matched Profiles Slider */}
      {matchedProfiles.length > 0 && (
        <View style={styles.matchedSection}>
          <Text style={styles.matchedTitle}>Your Matches</Text>
          <FlatList
            data={matchedProfiles}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.matchedProfile}
                onPress={() => {
                  // Create conversation ID using sorted participant IDs
                  const conversationId = [authUser!.uid, item.id].sort().join('_');
                  navigation.navigate('Chat', {
                    chatId: conversationId,
                    recipientId: item.id,
                    recipientName: item.name,
                  });
                }}
              >
                <Image 
                  source={{ uri: item.avatar }} 
                  style={styles.matchedAvatar}
                />
                <View style={styles.matchedBadge} />
                <Text style={styles.matchedName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.matchedList}
          />
        </View>
      )}

      {chats.length === 0 ? (
        <View style={[styles.emptyState]}>
          <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textTertiary} />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Start messaging with someone to begin</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.conversationId}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  chatList: {
    padding: SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  chatItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  time: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  unreadMessage: {
    color: COLORS.text,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadCount: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  matchedSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  matchedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  matchedList: {
    paddingHorizontal: 0,
  },
  matchedProfile: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  matchedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  matchedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  matchedName: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '500',
    maxWidth: 70,
    textAlign: 'center',
  },
});

export default ChatListScreen;
