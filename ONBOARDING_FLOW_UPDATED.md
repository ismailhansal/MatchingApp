# Onboarding Flow - Email/Password First

## Updated Flow

The signup process has been reorganized to collect email and password **first**, then continue through onboarding, and finally create the account:

### New Registration Flow
```
1. Login Screen
   ↓
2. User taps "Sign Up" 
   ↓
3. Onboarding Flow (5 steps):
   Step 1: Email & Password Input
   Step 2: Full Name Input
   Step 3: Role Selection (Mentor/Mentee)
   Step 4: Goals
   Step 5: Skills
   ↓
4. Account Created (at completion of step 5)
   ↓
5. Main App (automatically logged in)
```

## Changes Made

### [OnboardingFlow.tsx](src/screens/Onboarding/OnboardingFlow.tsx)

#### New State Variables
- `email` - User's email address
- `password` - User's password
- `confirmPassword` - Password confirmation
- `fullName` - User's full name
- `userType` - Role (mentor/mentee)
- `goals` - User's goals
- `skills` - User's skills
- `isPasswordVisible` - Toggle password visibility
- `isCreatingAccount` - Loading state during account creation
- `error` - Error message display

#### New Steps
```
Step 0: Email & Password
Step 1: Full Name
Step 2: Role Selection
Step 3: Goals
Step 4: Skills
```

#### Validation
Each step has validation before proceeding:
- **Email**: Required, must be valid email format
- **Password**: Required, minimum 6 characters, must match confirmation
- **Full Name**: Required, minimum 2 characters
- **Role**: Required (mentor or mentee)
- **Goals & Skills**: Optional

#### Account Creation
When user completes all steps:
1. Creates Firebase Auth user with email & password
2. Creates `users/{uid}` document with:
   - Email, full name, role
   - Default avatar (from DiceBear API)
   - Creation timestamp
3. Creates role-specific document:
   - `mentors/{uid}` OR `mentees/{uid}`
   - Skills array parsed from comma-separated input
   - Empty fields for bio, location, experience, etc.
4. User automatically logged in and navigates to Main app

### New UI Components

#### Email & Password Step
```tsx
- Email input field
- Password input field with visibility toggle
- Confirm Password input field
- Error message display
```

#### Styling
- Input fields match existing theme
- Password visibility toggle with eye emoji
- Error messages with colored background
- Form container for grouped inputs

## Key Features

✅ **Email/Password Collected First**
- User credentials established before profile creation
- Prevents duplicate emails

✅ **Real-time Validation**
- Clear error messages for each step
- Users know exactly what's wrong

✅ **Progress Indicators**
- Visual progress dots show position in flow
- 5 steps clearly shown

✅ **Loading State**
- Button shows "Creating Account..." during submission
- Button disabled while account is being created

✅ **Error Handling**
- Shows Firebase error messages
- Handles duplicate emails, weak passwords, etc.
- Allows user to go back and fix mistakes

✅ **Seamless Onboarding**
- All data collected in one flow
- No separate registration screen needed
- User logged in immediately after completion

## Removed Dependencies

The separate `RegisterScreen` is no longer used for signup (though it still exists in the app for other potential uses):
- Account creation now happens in `OnboardingFlow`
- No need to navigate away from onboarding to register

## Navigation Flow

```
LoginScreen
  ↓
  (User taps "Sign Up")
  ↓
OnboardingFlow
  Step 1: Email/Password → 
  Step 2: Name → 
  Step 3: Role → 
  Step 4: Goals → 
  Step 5: Skills → 
  (Create Account & Auto-login)
  ↓
Main App
```

## Testing Checklist

- [ ] Complete onboarding with valid email/password
- [ ] Verify account created in Firebase Auth
- [ ] Verify `users/{uid}` document in Firestore
- [ ] Verify `mentors/{uid}` OR `mentees/{uid}` created
- [ ] Check avatar set to DiceBear default
- [ ] Try invalid email → should show error
- [ ] Try weak password → should show error
- [ ] Try mismatched passwords → should show error
- [ ] Try duplicate email → should show Firebase error
- [ ] Go back to previous step → data persists
- [ ] After account creation → automatically in Main app
- [ ] Close app and re-open → stays logged in

## Error Messages

| Error | Trigger | Message |
|-------|---------|---------|
| Empty Email | Submit without email | "Please enter your email" |
| Invalid Email | Wrong format | "Please enter a valid email address" |
| Empty Password | Submit without password | "Please enter a password" |
| Weak Password | Less than 6 chars | "Password must be at least 6 characters" |
| Mismatched Passwords | Passwords don't match | "Passwords do not match" |
| Empty Name | Submit without name | "Please enter your full name" |
| Invalid Name | Less than 2 chars | "Please enter a valid name" |
| No Role Selected | Submit without role | "Please select your role" |
| Duplicate Email | Email exists | "This email is already registered" |
| Network Error | Connection lost | "An error occurred while creating your account" |

## Password Visibility Toggle

Users can toggle password visibility using the eye emoji icon:
- Shows password when tapped
- Hides password when tapped again
- Works on both password fields

## Skills Input

Skills are stored as an array but input as comma-separated text:
```typescript
// Input: "JavaScript, React, TypeScript"
// Stored as: ["JavaScript", "React", "TypeScript"]
```

---

**Onboarding is now fully streamlined with email/password collected first! 🎯**
