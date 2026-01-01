import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, commonStyles } from '../../theme';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuthState } from '../../hooks/useAuthState';
import { getCombinedUserProfile } from '../../services/userService';
import { 
  subscribeToMessages, 
  sendMessage, 
  Message 
} from '../../services/chatService';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { chatId, recipientName } = route.params;
  const [authUser, loading] = useAuthState();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '600' }}>{recipientName}</Text>,
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, recipientName]);

  useEffect(() => {
    if (!chatId) return;

    setMessagesLoading(true);
    const unsubscribe = subscribeToMessages(chatId, (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
      setMessagesLoading(false);
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (message.trim() === '' || !authUser) return;
    
    setIsSending(true);
    try {
      const userProfile = await getCombinedUserProfile(authUser.uid);
      
      await sendMessage(
        chatId,
        authUser.uid,
        userProfile?.fullName || 'Unknown User',
        userProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        message.trim()
      );
      
      setMessage('');
      Keyboard.dismiss();
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === authUser?.uid;
    
    return (
      <View style={[
        styles.messageBubble,
        isMe ? styles.myMessage : styles.theirMessage
      ]}>
        {!isMe && (
          <Image 
            source={{ uri: item.senderAvatar }} 
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageContent,
          isMe ? styles.myMessageContent : styles.theirMessageContent
        ]}>
          <Text style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timeText,
            isMe ? styles.myTimeText : styles.theirTimeText
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading || messagesLoading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyboardDismissMode="interactive"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
          </View>
        }
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="attach" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            editable={!isSending}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!message || isSending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={message ? COLORS.primary : COLORS.textTertiary} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    marginRight: SPACING.md,
  },
  messagesContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  myMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
    alignSelf: 'flex-end',
    marginBottom: SPACING.xs,
  },
  messageContent: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    maxWidth: '100%',
  },
  myMessageContent: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: BORDER_RADIUS.xs,
  },
  theirMessageContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xs,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: COLORS.white,
  },
  theirMessageText: {
    color: COLORS.text,
  },
  timeText: {
    fontSize: 10,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimeText: {
    color: COLORS.textTertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attachmentButton: {
    padding: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 120,
    color: COLORS.text,
    marginHorizontal: SPACING.xs,
  },
  sendButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;
