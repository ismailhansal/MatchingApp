import { 
  db,
} from '../config/firebase';
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

export interface Message {
  id: string;
  text: string;
  sender: string;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  participantAvatars: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSender: string;
  unreadCount: number;
  createdAt: Date;
}

// Get or create a conversation between two users
export const getOrCreateConversation = async (
  currentUserId: string,
  currentUserName: string,
  currentUserAvatar: string,
  otherUserId: string,
  otherUserName: string,
  otherUserAvatar: string
): Promise<string> => {
  // Create a consistent conversation ID based on user IDs
  const conversationId = [currentUserId, otherUserId].sort().join('_');
  const conversationRef = doc(db, 'conversations', conversationId);
  
  const conversationSnap = await getDoc(conversationRef);
  
  if (!conversationSnap.exists()) {
    // Create new conversation
    await setDoc(conversationRef, {
      participants: [currentUserId, otherUserId],
      participantNames: {
        [currentUserId]: currentUserName,
        [otherUserId]: otherUserName,
      },
      participantAvatars: {
        [currentUserId]: currentUserAvatar,
        [otherUserId]: otherUserAvatar,
      },
      lastMessage: '',
      lastMessageTime: Timestamp.now(),
      lastMessageSender: currentUserId,
      createdAt: Timestamp.now(),
    });
  }
  
  return conversationId;
};

// Send a message in a conversation
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  messageText: string
): Promise<void> => {
  try {
    // Add message to messages subcollection
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, {
      text: messageText,
      sender: senderId,
      senderName: senderName,
      senderAvatar: senderAvatar,
      timestamp: Timestamp.now(),
      read: false,
    });

    // Update conversation's last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: messageText,
      lastMessageTime: Timestamp.now(),
      lastMessageSender: senderId,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages from a conversation (one-time fetch)
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const snapshot = await getDocs(q);
    const messages: Message[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        text: data.text,
        sender: data.sender,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        timestamp: data.timestamp.toDate(),
        read: data.read || false,
      });
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Subscribe to real-time messages from a conversation
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        text: data.text,
        sender: data.sender,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        timestamp: data.timestamp.toDate(),
        read: data.read || false,
      });
    });
    callback(messages);
  });
  
  return unsubscribe;
};

// Get all conversations for a user
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const conversations: Conversation[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        participants: data.participants,
        participantNames: data.participantNames || {},
        participantAvatars: data.participantAvatars || {},
        lastMessage: data.lastMessage || '',
        lastMessageTime: data.lastMessageTime.toDate(),
        lastMessageSender: data.lastMessageSender || '',
        unreadCount: 0, // TODO: Implement unread count tracking
        createdAt: data.createdAt.toDate(),
      });
    });
    
    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

// Subscribe to real-time user conversations
export const subscribeToUserConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): (() => void) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        participants: data.participants,
        participantNames: data.participantNames || {},
        participantAvatars: data.participantAvatars || {},
        lastMessage: data.lastMessage || '',
        lastMessageTime: data.lastMessageTime.toDate(),
        lastMessageSender: data.lastMessageSender || '',
        unreadCount: 0,
        createdAt: data.createdAt.toDate(),
      });
    });
    callback(conversations);
  });
  
  return unsubscribe;
};

// Get the other participant's info in a conversation
export const getOtherParticipant = (
  conversation: Conversation,
  currentUserId: string
): { id: string; name: string; avatar: string } | null => {
  const otherUserId = conversation.participants.find((id) => id !== currentUserId);
  if (!otherUserId) return null;
  
  return {
    id: otherUserId,
    name: conversation.participantNames[otherUserId] || 'Unknown User',
    avatar: conversation.participantAvatars[otherUserId] || '',
  };
};
