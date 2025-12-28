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
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, commonStyles } from '../../theme';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

// Mock messages data
const mockMessages = [
  { id: '1', text: 'Hey there! How are you doing?', sender: 'them', time: '10:30 AM' },
  { id: '2', text: 'I\'m good, thanks for asking! How about you?', sender: 'me', time: '10:32 AM' },
  { id: '3', text: 'I\'m doing well! Just working on some React Native stuff.', sender: 'them', time: '10:33 AM' },
  { id: '4', text: 'That\'s great! Need any help with that?', sender: 'me', time: '10:35 AM' },
  { 
    id: '5', 
    text: 'Actually yes! I was wondering if you could help me with navigation in my app.', 
    sender: 'them', 
    time: '10:36 AM' 
  },
];

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { recipientName } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({
      title: recipientName,
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, recipientName]);

  const handleSend = () => {
    if (message.trim() === '') return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Scroll to bottom after sending a message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender === 'me';
    
    return (
      <View style={[
        styles.messageBubble,
        isMe ? styles.myMessage : styles.theirMessage
      ]}>
        {!isMe && (
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} 
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
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

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
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={message ? COLORS.primary : COLORS.textTertiary} 
            />
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
