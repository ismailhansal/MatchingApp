# Security & Environment Setup

## Overview
This project uses environment variables to keep sensitive credentials (API keys, Firebase config) out of version control.

## Setup Instructions

### 1. Create Local Environment File
Copy the template file and add your actual credentials:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your actual values:
- Firebase configuration from Firebase Console
- Cloudinary credentials

### 2. Environment Variables Required

**Firebase Configuration** (get from Firebase Console → Project Settings → Your apps → Web app config):
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

**Cloudinary Configuration**:
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### 3. Important: Expo Public Variables
In Expo, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the client-side application.
- These are safe to expose in the app (they're client-side only)
- Never add sensitive backend secrets with this prefix

### 4. .gitignore Protection
The following files are protected by `.gitignore`:
- `.env` - Local environment file (DO NOT COMMIT)
- `.env.local` - Local overrides
- `.env.*.local` - Environment-specific overrides
- `firebase-key.json` - Firebase service account keys
- `google-services.json` - Android Firebase config

## Before Pushing to Repository

✅ **Verify** that `.env` is in `.gitignore` (already configured)
✅ **Check** that no API keys appear in any source files
✅ **Use** `.env.example` as a template for new developers
✅ **Commit** only `.env.example`, never `.env`

## For New Developers

1. Clone the repository
2. Run `cp .env.example .env`
3. Fill in `.env` with their own credentials
4. Start developing (`.env` will not be tracked)

## Files Included in Repository
- `.env.example` - Template with empty values
- `src/config/firebase.ts` - Reads from env variables
- `src/services/imageService.ts` - Reads from env variables

## Files NOT Included in Repository (Protected by .gitignore)
- `.env` - Your actual credentials
- `.env.local` - Local overrides
- Any service account JSON files
- API key files

## Testing Environment Variables

When running with Expo:
```bash
npx expo start
```

Expo automatically loads variables from `.env` files. Check that your app initializes Firebase correctly by looking at console logs.

## Production Deployment

For Expo/EAS builds:
1. Use EAS Secrets to store environment variables securely
2. Reference: https://docs.expo.dev/build-reference/variables/
3. Never hardcode credentials in commits

Example:
```bash
eas secret:create --scope project EXPO_PUBLIC_FIREBASE_API_KEY
```

## Additional Security Notes

- Never commit `.env` files to git
- Never share API keys in code reviews or Slack
- Rotate Firebase API keys periodically
- Use Firebase Security Rules to restrict Firestore access
- Monitor Firebase console for unusual activity
