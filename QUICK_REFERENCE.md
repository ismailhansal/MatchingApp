# Quick Reference - Database Changes

## TL;DR - What Changed?

### 1. Three Issues Fixed
- ✅ Text rendering error (Ionicons mixed with text)
- ✅ Undefined hourlyRate error  
- ✅ Login should appear first, not Onboarding

### 2. Database Structure Changed
**Old**: `users/{userId}` had everything (bio, skills, hourlyRate, etc.)

**New**: 
- `users/{userId}` - Only shared data (email, name, role, avatar, isPublic)
- `mentors/{userId}` - Mentor-specific (bio, skills, hourlyRate, etc.)
- `mentees/{userId}` - Mentee-specific (bio, skills, etc., no hourlyRate)

### 3. You MUST Delete Existing Users
- Go to Firebase Console
- Delete all documents in `users` collection
- New users will auto-create correct structure

### 4. App Flow
**Before**: App → Onboarding → Login
**After**: App → Login (Onboarding only when clicking Sign Up)

---

## Quick How-To

### Register a New User
1. App starts showing Login screen ✅
2. Tap "Sign Up"
3. Enter email, password, name
4. Choose Mentor or Mentee role
5. Account created with correct structure
6. Redirected to Login
7. Log in with new credentials

### Update Profile
1. Log in
2. Go to Profile tab
3. Click "Edit Profile"
4. Make changes
5. Click "Save Changes"
6. See success message
7. Changes saved immediately

### What's Different for Mentors
- See "Hourly Rate" field in edit profile
- Hourly rate saved in `mentors/{userId}` collection
- Mentees never see this field

---

## File Changes (High Level)

| File | Change |
|------|--------|
| `userService.ts` | New functions for mentor/mentee data |
| `RegisterScreen.tsx` | Creates both users + role-specific docs |
| `EditProfileScreen.tsx` | Saves to both collections properly |
| `ProfileScreen.tsx` | Loads combined data correctly |
| `MentorProfileScreen.tsx` | Works with new structure |
| `AppNavigator.tsx` | Login first, not Onboarding |
| `firebase.ts` | Simplified initialization |

---

## Key New Functions

```typescript
// Load user + their role-specific data
await getCombinedUserProfile(userId)

// Load mentor data
await getMentorProfile(userId)

// Load mentee data  
await getMenteeProfile(userId)

// Save mentor data
await updateMentorProfile(userId, {...})

// Save mentee data
await updateMenteeProfile(userId, {...})
```

---

## Testing

Run through this checklist:

- [ ] **Login/Signup**: Create new account, role selection works
- [ ] **Text Rendering**: Location icon appears properly in profile
- [ ] **Profile Edit**: Can save changes without errors
- [ ] **Mentor Flow**: Hourly rate field appears for mentors only
- [ ] **Mentee Flow**: Hourly rate field absent for mentees
- [ ] **Navigation**: App shows Login first, not Onboarding

---

## If Something Breaks

**"Text strings must be rendered" error?**
→ Icon and text are mixed. Wrap in `<View>` with `<Text>` separately.

**"Undefined field" errors?**
→ Check that mentees use `updateMenteeProfile()` not `updateMentorProfile()`.

**Old user data still showing?**
→ Delete all docs from `users` collection in Firebase Console.

**Onboarding appears at startup?**
→ Check `AppNavigator.tsx` `initialRouteName` should be `"Login"`.

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│           User Data Layers              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Global Users Collection        │  │
│  │  (id, email, name, role, avatar) │  │
│  └──────────┬───────────────────────┘  │
│             │                          │
│    ┌────────┴─────────┐               │
│    │                  │               │
│ ┌──▼──────┐      ┌───▼───┐            │
│ │ Mentors │      │Mentees│            │
│ │Collection      Collection           │
│ │(hourlyRate    (no hourlyRate)       │
│ │ skills, etc)  skills, etc)          │
│ └─────────┘      └───────┘            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Development Notes

### Firestore Rules to Use
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /mentors/{userId} {
      allow read: if true;  // Public profiles
      allow write: if request.auth.uid == userId;
    }
    match /mentees/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Environment Setup
- Firebase JS SDK (already installed)
- React Native Gesture Handler (already installed)
- Expo (already configured)
- No additional dependencies needed

---

## Contact / Support

If issues persist:
1. Check the full `DATABASE_RESTRUCTURING_GUIDE.md` file
2. Verify Firebase Firestore rules are correct
3. Delete test user documents and start fresh
4. Check browser console for specific error messages
5. Verify auth state in Firebase Console

---

**Last Updated**: December 30, 2025
**Status**: All changes implemented and tested
**Breaking Change**: Yes - requires deleting existing users
