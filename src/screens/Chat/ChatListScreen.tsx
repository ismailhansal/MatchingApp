import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  Image, 
  ListRenderItem 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, commonStyles } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type ChatListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatList'>;

interface ChatItem {
  id: string;
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

// Mock data - replace with actual data from your backend
const mockChats = [
  {
    id: '1',
    name: 'Sarah Johnson',
    lastMessage: 'Hey! How are you doing?',
    time: '2h ago',
    unread: 2,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    lastMessage: 'Let\'s schedule a call for tomorrow',
    time: '5h ago',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Alex Rodriguez',
    lastMessage: 'I\'ve reviewed your project',
    time: '1d ago',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Emma Wilson',
    lastMessage: 'Thanks for the feedback!',
    time: '2d ago',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    isOnline: false,
  },
];

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState(mockChats);

  const renderChatItem: ListRenderItem<ChatItem> = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { 
        chatId: item.id,
        recipientId: item.id,
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

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
      />
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
});

export default ChatListScreen;
