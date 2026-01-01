# Environment Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

### 3. Fill in Your Credentials

Edit `.env` and add your actual values:

**Firebase** (from Firebase Console → Project Settings):
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Cloudinary** (from Cloudinary Dashboard):
```
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Start Development
```bash
npx expo start
```

## Important Notes

- **Never commit** `.env` to git (it's in `.gitignore`)
- **Only `.env.example`** should be committed to repository
- **Each developer** needs their own `.env` file with credentials
- **Use `.env.example`** as a template

## Before Pushing to GitHub

Verify:
- ✅ `.env` is in `.gitignore`
- ✅ No API keys in any `.ts` or `.tsx` files
- ✅ Only `.env.example` is tracked by git
- ✅ `.env` is in your `.gitignore` locally

## For Team Collaboration

1. Share `.env.example` with team (it has no secrets)
2. Each team member creates their own `.env` from template
3. Each team member fills in their own credentials
4. **Never share `.env` files via Slack, email, or git**

## Security Best Practices

- Rotate API keys periodically
- Don't share credentials in code reviews
- Use different keys for dev/production if possible
- Monitor Firebase/Cloudinary dashboards for unusual activity

See `SECURITY.md` for more details.
