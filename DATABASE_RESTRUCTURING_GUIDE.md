# Database Restructuring & Bug Fixes - Complete Guide

## Overview
This document explains the major changes made to your MentorMatch application, including database schema restructuring, bug fixes, and authentication flow improvements.

---

## 1. DATABASE RESTRUCTURING

### Previous Structure (Single Collection)
```
users/
  ├── {userId}/
  │   ├── id, email, fullName, role
  │   ├── bio, skills, location, experience
  │   ├── education, languages, hourlyRate
  │   ├── availability, isPublic, avatar
```

### New Structure (Optimized with Subcollections)
```
users/ (Global - shared data)
  ├── {userId}/
  │   ├── id (string)
  │   ├── email (string)
  │   ├── fullName (string)
  │   ├── role ('mentor' | 'mentee')
  │   ├── avatar (string)
  │   ├── isPublic (boolean)
  │   ├── createdAt (ISO string)
  │
mentors/ (Mentor-specific data)
  ├── {userId}/
  │   ├── bio (string)
  │   ├── skills (string[])
  │   ├── location (string)
  │   ├── experience (string)
  │   ├── education (string)
  │   ├── languages (string[])
  │   ├── availability (string)
  │   ├── hourlyRate (number)
  │
mentees/ (Mentee-specific data)
  ├── {userId}/
  │   ├── bio (string)
  │   ├── skills (string[])
  │   ├── location (string)
  │   ├── experience (string)
  │   ├── education (string)
  │   ├── languages (string[])
  │   ├── availability (string)
```

### Benefits
1. **Role-specific data isolation** - Mentors have hourlyRate, mentees don't
2. **Cleaner queries** - Load only relevant data
3. **Better scalability** - Easy to add mentor/mentee-specific features
4. **Prevents undefined field errors** - No more `hourlyRate: undefined` issues

---

## 2. BREAKING CHANGES - YOU MUST DELETE EXISTING USERS

**Important:** The new schema is incompatible with the old one. You need to:

### Steps to Migrate:
1. **Delete all existing users from Firebase**:
   - Go to Firebase Console → Firestore Database
   - Delete all documents in the `users` collection
   - Ensure no `mentors` or `mentees` collections exist yet

2. **Sign up new users** - They will automatically create the correct structure

### Firestore Rules Update (Recommended)
Update your Firestore security rules to protect the new collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Mentors collection
    match /mentors/{userId} {
      allow read: if true; // Public profiles
      allow write: if request.auth.uid == userId;
    }
    
    // Mentees collection
    match /mentees/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 3. BUG FIXES

### Bug #1: Text Rendering Error
**Problem**: "ERROR Text strings must be rendered within a <Text> component"

**Root Cause**: In [ProfileScreen.tsx](src/screens/Profile/ProfileScreen.tsx#L79-L85), Ionicons icon and text were mixed in a single Text component:
```tsx
// ❌ WRONG
<Text style={styles.location}>
  <Ionicons name="location" size={16} /> {userProfile.location}
</Text>
```

**Solution**: Separated them into a View with proper structure:
```tsx
// ✅ CORRECT
<View style={styles.locationContainer}>
  <Ionicons name="location" size={16} color={COLORS.primary} />
  <Text style={styles.location}>{roleData.location}</Text>
</View>
```

### Bug #2: Undefined hourlyRate Error
**Problem**: "FirebaseError: Unsupported field value: undefined (found in field hourlyRate)"

**Root Cause**: Attempting to save `hourlyRate: undefined` for mentees

**Solution**: Added filtering logic in [userService.ts](src/services/userService.ts#L110-L130):
```typescript
// Filter out undefined values before saving
const filteredData = Object.fromEntries(
  Object.entries(data).filter(([, value]) => value !== undefined)
);
```

---

## 4. AUTHENTICATION FLOW CHANGES

### Previous Flow
```
App Launch → Onboarding → Login → Main App
```

### New Flow
```
App Launch → Login → (on signup) → Registration → Main App
            ↓
         [Onboarding only shown on "Sign Up" button]
```

### Changes Made:

1. **[AppNavigator.tsx](src/navigation/AppNavigator.tsx#L159)**:
   - Changed `initialRouteName` from `"Onboarding"` to dynamic based on auth state
   - Removed automatic logout on app start
   - Removed AsyncStorage first-launch tracking

2. **Auth Flow Logic**:
   ```typescript
   initialRouteName={isAuthenticated ? "Main" : "Login"}
   ```

3. **Navigation Order in Stack**:
   - Login appears before Onboarding
   - Onboarding only reachable via signup flow

---

## 5. UPDATED SERVICES

### New Functions in userService.ts

```typescript
// Get global user profile only
getUserProfile(userId: string): Promise<UserProfile | null>

// Get mentor-specific data
getMentorProfile(userId: string): Promise<MentorProfile | null>

// Get mentee-specific data
getMenteeProfile(userId: string): Promise<MenteeProfile | null>

// Get combined profile (global + role-specific)
getCombinedUserProfile(userId: string): Promise<CombinedUserProfile | null>

// Update global profile
updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void>

// Update mentor-specific profile
updateMentorProfile(userId: string, data: Partial<MentorProfile>): Promise<void>

// Update mentee-specific profile
updateMenteeProfile(userId: string, data: Partial<MenteeProfile>): Promise<void>

// Create new user documents (call during registration)
createUserDocuments(userId: string, globalData: UserProfile, roleSpecificData): Promise<void>
```

---

## 6. UPDATED SCREENS

### [RegisterScreen.tsx](src/screens/Auth/RegisterScreen.tsx#L83-L113)
- Creates both global and role-specific documents
- Properly separates mentor vs mentee fields
- Prevents undefined field errors

### [EditProfileScreen.tsx](src/screens/Profile/EditProfileScreen.tsx)
- Uses `getCombinedUserProfile()` to load data
- Updates global and role-specific profiles separately
- Shows loading state during save
- Filters undefined values before saving
- Added success/error alerts

### [ProfileScreen.tsx](src/screens/Profile/ProfileScreen.tsx)
- Uses `getCombinedUserProfile()` to fetch data
- Accesses role-specific data via `roleData` variable
- Displays role-specific fields correctly

### [MentorProfileScreen.tsx](src/screens/Profile/MentorProfileScreen.tsx)
- Updated to work with new `CombinedUserProfile` type
- Properly displays mentor-specific information
- Safe optional chaining for missing fields

---

## 7. FIREBASE CONFIGURATION

### Updated [firebase.ts](src/config/firebase.ts)
- Changed from `initializeAuth` with AsyncStorage persistence to simple `getAuth()`
- Simpler, more compatible with Expo React Native setup
- Removed AsyncStorage import

```typescript
// ✅ NEW (Simplified)
export const auth = getAuth(app);

// ❌ OLD (Removed)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```

---

## 8. TESTING CHECKLIST

After these changes, test the following:

### Authentication
- [ ] Tap "Sign Up" button on Login screen
- [ ] Fill in registration form (name, email, password)
- [ ] Choose role (Mentor/Mentee)
- [ ] Account created successfully
- [ ] Redirected to Login screen
- [ ] Can log in with new account

### Profile Management
- [ ] Navigate to Profile tab
- [ ] View profile information loads
- [ ] Click "Edit Profile"
- [ ] Modify fields (name, bio, skills, etc.)
- [ ] Click "Save Changes"
- [ ] See success alert
- [ ] Changes persist when navigating away and back

### Data Integrity
- [ ] Mentors see hourlyRate field in edit profile
- [ ] Mentees do NOT see hourlyRate field
- [ ] No "undefined" errors in console
- [ ] No Firebase errors on profile update
- [ ] Text renders properly (icons and text separated)

### Mentor Discovery
- [ ] View mentor profiles
- [ ] Mentor data loads correctly
- [ ] Skills, experience, education display properly
- [ ] No console errors

---

## 9. NEXT STEPS

### To Implement Onboarding in Signup Flow
1. Create a registration wizard that uses Onboarding screens
2. Collect user data through onboarding
3. Pass collected data to registration endpoint
4. Create user with complete profile in one step

### Example Structure:
```
SignUp Button (Login screen)
    ↓
Onboarding Flow (collect data)
    ↓
Review & Confirm
    ↓
Register with all data
    ↓
Auto-login → Main App
```

---

## 10. TROUBLESHOOTING

### If users still appear in old format:
1. Check Firestore console
2. Delete old user documents
3. Create new test account
4. Verify new structure is created correctly

### If "undefined field" errors persist:
1. Check [userService.ts](src/services/userService.ts) filtering logic
2. Verify `updateMentorProfile()` or `updateMenteeProfile()` is being called
3. Ensure no direct `updateUserProfile()` calls with role-specific fields

### If text rendering errors continue:
1. Search for direct mixing of Ionicons and text in JSX
2. Wrap text elements properly in `<Text>` components
3. Check all profile/card components

---

## Summary of Files Changed

1. ✅ [src/services/userService.ts](src/services/userService.ts) - New database functions
2. ✅ [src/screens/Auth/RegisterScreen.tsx](src/screens/Auth/RegisterScreen.tsx) - New registration flow
3. ✅ [src/screens/Profile/EditProfileScreen.tsx](src/screens/Profile/EditProfileScreen.tsx) - Profile update logic
4. ✅ [src/screens/Profile/ProfileScreen.tsx](src/screens/Profile/ProfileScreen.tsx) - Profile display
5. ✅ [src/screens/Profile/MentorProfileScreen.tsx](src/screens/Profile/MentorProfileScreen.tsx) - Mentor profile view
6. ✅ [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx) - Auth flow
7. ✅ [src/config/firebase.ts](src/config/firebase.ts) - Firebase init

---

**All changes are backward incompatible. You must delete existing users and test with fresh accounts.**
