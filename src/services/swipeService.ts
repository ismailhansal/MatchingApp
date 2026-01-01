import { db, auth } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  setDoc, 
  getDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { sendMessage } from './chatService';

export interface SwipeRecord {
  userId: string;
  targetUserId: string;
  direction: 'left' | 'right';
  timestamp: Timestamp;
}

/**
 * Get all mentors or mentees from Firebase based on user's role
 * Fetches both role-specific profile and user profile data
 */
export const getDiscoverUsers = async (currentUserId: string, currentUserRole: 'mentor' | 'mentee') => {
  try {
    const targetRole = currentUserRole === 'mentor' ? 'mentee' : 'mentor';
    const targetCollection = targetRole === 'mentor' ? 'mentors' : 'mentees';
    
    // Get all users of the opposite role
    const usersRef = collection(db, targetCollection);
    const querySnapshot = await getDocs(usersRef);
    
    // Fetch both role-specific profile and user profile for each user
    const users = await Promise.all(
      querySnapshot.docs
        .filter(docSnap => docSnap.id !== currentUserId) // Exclude self
        .map(async (docSnap) => {
          // Get user profile for avatar, name, etc
          const userDocRef = doc(db, 'users', docSnap.id);
          const userSnap = await getDoc(userDocRef);
          const userProfile = userSnap.data() as any;
          
          return {
            id: docSnap.id,
            // User profile data
            name: userProfile?.fullName || 'User',
            avatar: userProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
            photo: userProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default', // Use avatar as photo
            role: userProfile?.role || 'mentor',
            // Role-specific profile data
            ...docSnap.data()
          };
        })
    );
    
    return users;
  } catch (error) {
    console.error('Error fetching discover users:', error);
    throw error;
  }
};

/**
 * Record a swipe action
 */
export const recordSwipe = async (
  userId: string,
  targetUserId: string,
  direction: 'left' | 'right'
) => {
  try {
    console.log(`Recording swipe: ${userId} -> ${targetUserId} (${direction})`);
    
    const swipeRef = doc(
      db,
      'swipes',
      `${userId}_${targetUserId}`
    );
    
    const swipeData = {
      userId,
      targetUserId,
      direction,
      timestamp: Timestamp.now(),
    };
    
    console.log('Swipe data:', swipeData);
    await setDoc(swipeRef, swipeData);
    console.log('Swipe recorded successfully');

    // Check if this creates a match
    if (direction === 'right') {
      await checkAndCreateMatch(userId, targetUserId);
    }
  } catch (error) {
    console.error('Error recording swipe:', error);
    throw error;
  }
};

/**
 * Check if swipe creates a mutual match
 */
const checkAndCreateMatch = async (userId: string, targetUserId: string) => {
  try {
    console.log(`Checking for mutual match between ${userId} and ${targetUserId}`);
    
    // Check if target user has already swiped right on userId
    const reverseSwipeRef = doc(db, 'swipes', `${targetUserId}_${userId}`);
    const reverseSwipeSnap = await getDoc(reverseSwipeRef);

    if (reverseSwipeSnap.exists() && reverseSwipeSnap.data().direction === 'right') {
      console.log('Mutual match found! Creating match and conversation...');
      // Mutual match! Create conversation and send intro message
      await createMatchAndConversation(userId, targetUserId);
    } else {
      console.log('No mutual match yet (reverse swipe does not exist or is left)');
    }
  } catch (error) {
    console.error('Error checking for match:', error);
    if (error instanceof Error && error.message.includes('permission')) {
      console.error('Permission denied - this is expected if reverse swipe does not exist yet');
      // Don't throw - this is not a fatal error
      return;
    }
    // For other errors, rethrow
    throw error;
  }
};

/**
 * Create match record and conversation
 */
const createMatchAndConversation = async (userId: string, targetUserId: string) => {
  try {
    console.log(`Creating match and conversation between ${userId} and ${targetUserId}`);
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No current user for match creation');
      return;
    }

    // Fetch both users' data first
    const userDocRef = doc(db, 'users', userId);
    const targetDocRef = doc(db, 'users', targetUserId);
    
    const userDocSnap = await getDoc(userDocRef);
    const targetDocSnap = await getDoc(targetDocRef);
    
    if (!userDocSnap.exists() || !targetDocSnap.exists()) {
      console.error('One or both user documents do not exist');
      return;
    }

    const userRole = userDocSnap.data().role;
    const targetRole = targetDocSnap.data().role;
    
    // Determine mentor and mentee
    const mentorId = userRole === 'mentor' ? userId : targetUserId;
    const menteeId = userRole === 'mentor' ? targetUserId : userId;

    console.log(`Match roles - Mentor: ${mentorId}, Mentee: ${menteeId}`);

    // Get mentor and mentee data
    const mentorRef = doc(db, 'users', mentorId);
    const menteeRef = doc(db, 'users', menteeId);
    
    const mentorSnap = await getDoc(mentorRef);
    const menteeSnap = await getDoc(menteeRef);
    
    if (!mentorSnap.exists() || !menteeSnap.exists()) {
      console.error('Mentor or mentee document not found');
      return;
    }

    const mentorData = mentorSnap.data();
    const menteeData = menteeSnap.data();

    // Create match record
    const matchRef = doc(db, 'matches', `${mentorId}_${menteeId}`);
    const matchData = {
      mentorId,
      menteeId,
      createdAt: Timestamp.now(),
      status: 'active',
    };
    
    console.log('Creating match with data:', matchData);
    await setDoc(matchRef, matchData);
    console.log('Match created successfully');

    // Create conversation (using sorted IDs for consistency)
    const conversationId = [mentorId, menteeId].sort().join('_');
    const conversationRef = doc(db, 'conversations', conversationId);
    
    console.log(`Checking if conversation ${conversationId} exists...`);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      const conversationData = {
        participants: [mentorId, menteeId],
        participantNames: {
          [mentorId]: mentorData.fullName || 'Mentor',
          [menteeId]: menteeData.fullName || 'Mentee',
        },
        participantAvatars: {
          [mentorId]: mentorData.avatar || '',
          [menteeId]: menteeData.avatar || '',
        },
        createdAt: Timestamp.now(),
      };
      
      console.log('Creating conversation with data:', conversationData);
      try {
        await setDoc(conversationRef, conversationData);
        console.log('Conversation created successfully');
      } catch (convError) {
        console.error('Error creating conversation document:', convError);
        throw convError;
      }

      // Send intro message from mentee to mentor
      try {
        const menteeUserData = menteeId === userId ? userDocSnap.data() : targetDocSnap.data();
        const menteeName = menteeUserData?.fullName || 'User';
        const menteeAvatar = menteeUserData?.avatar || '';
        
        console.log('Sending intro message from mentee...');
        await sendMessage(
          conversationId,
          menteeId,
          menteeName,
          menteeAvatar,
          `Hi ${mentorData.fullName || 'Mentor'}! I'd like to connect with you.`
        );
        console.log('Intro message sent from mentee to mentor');
      } catch (messageError) {
        console.error('Error sending intro message:', messageError);
        // Don't throw - message failure shouldn't block match creation
      }
    } else {
      console.log('Conversation already exists');
    }

    console.log('Match created between', mentorId, 'and', menteeId);
  } catch (error) {
    console.error('Error creating match and conversation:', error);
    throw error;
  }
};

/**
 * Get all matches for current user
 */
export const getUserMatches = async (userId: string) => {
  try {
    const matchesRef = collection(db, 'matches');
    
    // Query matches where user is either mentor or mentee
    const mentorQuery = query(matchesRef, where('mentorId', '==', userId));
    const menteeQuery = query(matchesRef, where('menteeId', '==', userId));
    
    const [mentorMatches, menteeMatches] = await Promise.all([
      getDocs(mentorQuery),
      getDocs(menteeQuery),
    ]);

    const allMatches = [
      ...mentorMatches.docs.map(doc => ({
        id: doc.id,
        mentorId: doc.data().mentorId,
        menteeId: doc.data().menteeId,
        ...doc.data()
      })),
      ...menteeMatches.docs.map(doc => ({
        id: doc.id,
        mentorId: doc.data().mentorId,
        menteeId: doc.data().menteeId,
        ...doc.data()
      })),
    ];

    return allMatches;
  } catch (error) {
    console.error('Error fetching user matches:', error);
    throw error;
  }
};

/**
 * Filter out already matched profiles
 */
export const filterOutMatched = async (profiles: any[], userId: string) => {
  try {
    const matches = await getUserMatches(userId);
    const matchedIds = new Set();

    matches.forEach(match => {
      matchedIds.add(match.mentorId);
      matchedIds.add(match.menteeId);
    });

    return profiles.filter(profile => !matchedIds.has(profile.id));
  } catch (error) {
    console.error('Error filtering matched profiles:', error);
    return profiles; // Return all profiles if filtering fails
  }
};
