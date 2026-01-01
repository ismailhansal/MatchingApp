# Debugging Image Upload to Cloudinary

## The Problem
Images are being saved as local file paths (`file:///data/user/0/...`) instead of Cloudinary URLs.

## Why This Happens
The upload to Cloudinary is failing with a "Network request failed" error. The app catches the error but may be saving anyway.

## Step-by-Step Debugging

### 1. Check Console Logs
When you try to upload an image, look for these logs (in terminal where `npx expo start` is running):

**Expected Success Logs:**
```
Starting image upload for file: file:///data/user/0/...
Fetching image from: file:///data/user/0/...
Image blob size: XXXXX bytes
Blob type: image/jpeg
Uploading to Cloudinary: https://api.cloudinary.com/v1_1/dv0znr5ps/image/upload
Upload preset: profile_pics
Cloudinary response status: 200
Upload successful, URL: https://res.cloudinary.com/dv0znr5ps/image/upload/v...
```

**Expected Error Logs (if upload fails):**
```
Starting image upload for file: file:///data/user/0/...
...
Error uploading image: [specific error message]
Image upload failed, will not save profile: [error]
```

### 2. Check Cloudinary Dashboard

First, find your Media Library:
1. Go to **cloudinary.com**
2. Log in to your account
3. In the left sidebar, click **"Media Library"** (or look for a folder icon)
4. Or go directly to: `https://cloudinary.com/console/media_library`
5. Look in the **`profile-pictures/`** folder
6. If images appear here, the upload is working!

### 3. Check Firestore
If the upload fails, Firestore will have the local file path. If successful, it will have a Cloudinary URL:

**Wrong (local file):**
```
avatar: "file:///data/user/0/host.exp.exponent/cache/ImagePicker/..."
```

**Correct (Cloudinary URL):**
```
avatar: "https://res.cloudinary.com/dv0znr5ps/image/upload/v..."
```

## Common Issues & Solutions

### Issue 1: "Network request failed"
**Possible Causes:**
- Unsigned preset not created correctly
- Preset name is wrong (`profile_pics` vs `profile_pictures`, etc.)
- Cloudinary API URL is wrong
- Network timeout

**Check:**
1. Go to Cloudinary Settings → Upload → Upload presets
2. Find `profile_pics` and verify:
   - **Status:** "Enabled"
   - **Unsigned:** Toggled ON (critical!)
3. Copy exact preset name and confirm it matches in imageService.ts:
   ```typescript
   const CLOUDINARY_UPLOAD_PRESET = 'profile_pics';
   ```

### Issue 2: Upload succeeds but image doesn't show
- Image is in Firestore as Cloudinary URL
- But doesn't display in the app

**Solution:**
- Cloudinary CDN should be available globally
- Make sure you're using `secure_url` (https://) not `url` (http://)
- Clear app cache: `npx expo start --clear`

### Issue 3: "Response is not JSON"
- Cloudinary returned HTML error page instead of JSON
- Usually means authentication failed

**Check:**
- Go back to Unsigned Upload Preset verification above
- Make sure UNSIGNED is ON

## Testing Checklist

- [ ] 1. Clear app cache: `npx expo start --clear`
- [ ] 2. Open app and go to Profile → Edit Profile
- [ ] 3. Tap camera icon to pick an image
- [ ] 4. Watch console for logs (see Step 1 above)
- [ ] 5. Save profile
- [ ] 6. Check Firestore for avatar URL
- [ ] 7. Check Cloudinary Media Library for image
- [ ] 8. Go back to Profile screen - image should show

## If Still Failing

1. **Check the exact error message** in console
2. **Verify upload preset name** character-by-character
3. **Try uploading directly to Cloudinary** (via their web interface) to confirm account is working
4. **Check your Cloudinary account is free tier** (should be)
5. **Check internet connection** (upload needs good connection)

## Expected Files After Successful Upload

1. **Firestore** `users/{uid}` document:
   - `avatar: "https://res.cloudinary.com/dv0znr5ps/image/upload/v1234567890/profile-pictures/{userId}/avatar_{userId}.jpg"`

2. **Cloudinary Media Library**:
   - Folder: `profile-pictures/{userId}/`
   - File: `avatar_{userId}.jpg`

3. **App Display**:
   - Profile screen shows the uploaded image (not the default DiceBear avatar)
