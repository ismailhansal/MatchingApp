import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Global user profile interface (shared data)
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'mentor' | 'mentee';
  avatar: string;
  isPublic: boolean;
  createdAt: string;
}

// Mentor-specific data
export interface MentorProfile {
  bio: string;
  skills: string[];
  location: string;
  experience: string;
  education: string;
  languages: string[];
  hourlyRate?: number;
  availability: string;
}

// Mentee-specific data
export interface MenteeProfile {
  bio: string;
  skills: string[];
  location: string;
  experience: string;
  education: string;
  languages: string[];
  availability: string;
}

// Combined profile type for easier use
export interface CombinedUserProfile extends UserProfile {
  mentorData?: MentorProfile;
  menteeData?: MenteeProfile;
}

// Get global user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Get mentor-specific data
export const getMentorProfile = async (userId: string): Promise<MentorProfile | null> => {
  try {
    const docRef = doc(db, 'mentors', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as MentorProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    throw error;
  }
};

// Get mentee-specific data
export const getMenteeProfile = async (userId: string): Promise<MenteeProfile | null> => {
  try {
    const docRef = doc(db, 'mentees', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as MenteeProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching mentee profile:', error);
    throw error;
  }
};

// Get combined user profile (global + role-specific data)
export const getCombinedUserProfile = async (userId: string): Promise<CombinedUserProfile | null> => {
  try {
    const globalProfile = await getUserProfile(userId);
    if (!globalProfile) return null;

    if (globalProfile.role === 'mentor') {
      const mentorData = await getMentorProfile(userId);
      return {
        ...globalProfile,
        mentorData: mentorData || undefined,
      };
    } else {
      const menteeData = await getMenteeProfile(userId);
      return {
        ...globalProfile,
        menteeData: menteeData || undefined,
      };
    }
  } catch (error) {
    console.error('Error fetching combined profile:', error);
    throw error;
  }
};

// Update global user profile
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update mentor-specific profile
export const updateMentorProfile = async (userId: string, data: Partial<MentorProfile>) => {
  try {
    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );
    
    const docRef = doc(db, 'mentors', userId);
    await updateDoc(docRef, filteredData);
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    throw error;
  }
};

// Update mentee-specific profile
export const updateMenteeProfile = async (userId: string, data: Partial<MenteeProfile>) => {
  try {
    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );
    
    const docRef = doc(db, 'mentees', userId);
    await updateDoc(docRef, filteredData);
  } catch (error) {
    console.error('Error updating mentee profile:', error);
    throw error;
  }
};

// Create initial user documents (call this during registration)
export const createUserDocuments = async (
  userId: string,
  globalData: UserProfile,
  roleSpecificData: MentorProfile | MenteeProfile
) => {
  try {
    // Create global user document
    await setDoc(doc(db, 'users', userId), globalData);

    // Create role-specific document
    const collectionName = globalData.role === 'mentor' ? 'mentors' : 'mentees';
    await setDoc(doc(db, collectionName, userId), roleSpecificData);
  } catch (error) {
    console.error('Error creating user documents:', error);
    throw error;
  }
};