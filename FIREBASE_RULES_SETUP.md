# Firebase Configuration - Firestore & Storage Rules

## Firestore Rules (REQUIRED)

Replace your existing Firestore rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Mentors collection - public read, write only own
    match /mentors/{userId} {
      allow read: if true;  // Public profiles
      allow write: if request.auth.uid == userId;
    }
    
    // Mentees collection - private, write only own
    match /mentees/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Conversations collection - only participants can access
    match /conversations/{conversationId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      allow create: if request.auth.uid in request.resource.data.participants;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow create: if request.auth.uid == request.resource.data.sender && 
                         request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow update, delete: if request.auth.uid == resource.data.sender;
      }
    }
  }
}
```

## Firebase Storage Rules (NOT NEEDED)

**Profile images are now hosted on Cloudinary** instead of Firebase Storage. You do not need to set up Firebase Storage rules.

## Steps to Update Rules in Firebase Console

### For Firestore:
1. Go to Firebase Console → Your Project
2. Click on "Firestore Database" in left menu
3. Click on "Rules" tab
4. Replace all content with the Firestore rules above
5. Click "Publish"

## What These Rules Do

### Firestore Rules:
- **users/**: Private - only the user can read/write their own profile
- **mentors/**: Public read (anyone can see), private write (only the mentor can edit)
- **mentees/**: Private - only the mentee can read/write their own profile
- **conversations/**: Only participants in the conversation can read/write messages
- **messages/** (subcollection): Only conversation participants can read, participants can create, senders can delete

### Image Hosting:
- **Profile images**: Hosted on Cloudinary (no Firebase Storage needed)
- Images stored in Cloudinary's `profile-pictures/{userId}/` folder
- URLs are publicly readable, secured by upload preset

## Common Issues Fixed

1. **Permission Denied on Messages**: Fixed by properly scoping conversations access
2. **Permission Denied on Profile Upload**: Fixed by adding Storage rules
3. **Missing conversations structure**: Added proper subcollection rules for messages
