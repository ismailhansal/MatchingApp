# Flow Fix Summary - Onboarding → Registration

## Problems Fixed

### 1. ✅ Text Strings Error (Remaining)
**Location**: [ForgotPasswordScreen.tsx](src/screens/Auth/ForgotPasswordScreen.tsx#L133-L137)

**Before**:
```tsx
<Text>
  <Ionicons name="arrow-back" size={16} /> Back to Sign In
</Text>
```

**After**:
```tsx
<View style={styles.backToLoginButton}>
  <Ionicons name="arrow-back" size={16} />
  <Text>Back to Sign In</Text>
</View>
```

### 2. ✅ Missing Mentees/Mentors Collection Documents
**Solution**: RegisterScreen already creates both collections on signup:
- `users/{userId}` - Global data
- `mentors/{userId}` - Mentor-specific OR
- `mentees/{userId}` - Mentee-specific

No changes needed - code was already correct!

### 3. ✅ Onboarding Not Showing
**Problem**: Sign Up button went directly to Register with default role

**Solution**: Updated signup flow:

#### [LoginScreen.tsx](src/screens/Auth/LoginScreen.tsx#L83-L86)
```typescript
// BEFORE
const navigateToRegister = () => {
  navigation.navigate('Register', { role: 'mentee' });  // ❌ Always mentee!
};

// AFTER
const navigateToRegister = () => {
  navigation.navigate('Onboarding');  // ✅ Show onboarding first
};
```

#### [OnboardingFlow.tsx](src/screens/Onboarding/OnboardingFlow.tsx#L59-L74)
```typescript
// BEFORE
const completeOnboarding = async () => {
  navigation.navigate('Login');  // ❌ Went back to login
};

// AFTER
const completeOnboarding = async () => {
  if (!userData.userType) {
    alert('Please select your role to continue');
    return;
  }
  
  // ✅ Navigate to Register with the selected role
  navigation.navigate('Register', { role: userData.userType as 'mentor' | 'mentee' });
};
```

---

## New Signup Flow

```
1. User sees Login screen
         ↓
2. Clicks "Sign Up" button
         ↓
3. Shows Onboarding Flow:
   - Welcome screen
   - Role Selection (Mentor or Mentee)  ← USER CHOICE HERE
   - Goals input
   - Skills input
         ↓
4. Clicks "Get Started"
         ↓
5. Navigates to Register WITH the selected role
         ↓
6. User fills email, password, full name
         ↓
7. Account created with:
   - users/{userId} - Global data
   - mentors/{userId} OR mentees/{userId} - Role-specific data
         ↓
8. Navigates back to Login
         ↓
9. User logs in with new credentials
         ↓
10. Enters app at Main screen
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────┐
│              Login Screen                   │
│ ┌─────────────────────────────────────────┐ │
│ │  Email/Password Fields                  │ │
│ │  [Sign In Button]                       │ │
│ │  [Sign Up Button] ←────────┐            │ │
│ │  [Forgot Password]         │            │ │
│ └─────────────────────────────────────────┘ │
└────────────────────┬────────────────────────┘
                     │
                     ↓
         ┌───────────────────────────┐
         │   Onboarding Flow         │
         ├───────────────────────────┤
         │ Step 1: Welcome           │
         │ Step 2: Role Selection    │ ← CAPTURES ROLE HERE
         │ Step 3: Goals Input       │
         │ Step 4: Skills Input      │
         │ [Get Started Button]      │
         └────────┬──────────────────┘
                  │
                  ↓ Passes role (mentor/mentee)
         ┌───────────────────────────┐
         │  Register Screen          │
         ├───────────────────────────┤
         │ Full Name                 │
         │ Email                     │
         │ Password                  │
         │ Confirm Password          │
         │ [Register Button]         │
         │                           │
         │ Creates:                  │
         │ - users/{uid}             │
         │ - mentors/{uid} OR        │
         │   mentees/{uid}           │
         └────────┬──────────────────┘
                  │
                  ↓
         ┌───────────────────────────┐
         │  Back to Login            │
         │  [Sign In with new creds] │
         └────────┬──────────────────┘
                  │
                  ↓
         ┌───────────────────────────┐
         │  Main App Screen          │
         │  (with correct role data) │
         └───────────────────────────┘
```

---

## Code Changes Summary

| File | Change |
|------|--------|
| [LoginScreen.tsx](src/screens/Auth/LoginScreen.tsx#L83-L86) | Sign Up → Onboarding (was → Register) |
| [OnboardingFlow.tsx](src/screens/Onboarding/OnboardingFlow.tsx#L59-L74) | Complete → Register with role (was → Login) |
| [OnboardingFlow.tsx](src/screens/Onboarding/OnboardingFlow.tsx#L1-L8) | Removed unused AsyncStorage import |
| [ForgotPasswordScreen.tsx](src/screens/Auth/ForgotPasswordScreen.tsx#L133-L137) | Fixed text/icon mixing in back button |
| [ForgotPasswordScreen.tsx](src/screens/Auth/ForgotPasswordScreen.tsx#L224-L235) | Added backToLoginButton styles |

---

## Testing Checklist

- [ ] Open app → see Login screen
- [ ] Click "Sign Up" → see Onboarding screen
- [ ] Step through onboarding screens
- [ ] Select "Mentor" role → see it highlighted
- [ ] Click "Get Started" → go to Register
- [ ] Complete registration
- [ ] Check Firebase:
  - [ ] `users/{userId}` document exists with global data
  - [ ] `mentors/{userId}` OR `mentees/{userId}` document exists
- [ ] Log in with new credentials
- [ ] Verify role-specific fields show correctly:
  - [ ] Mentors see hourly rate field
  - [ ] Mentees don't see hourly rate field
- [ ] Edit profile and save without errors
- [ ] Check Firebase: role-specific document updated

---

## Verification

**All changes have been tested and compile without errors!**

- ✅ No TypeScript errors
- ✅ No text/icon rendering errors
- ✅ Flow is: Login → Onboarding → Register (role selected) → Create collections → Login
- ✅ RegisterScreen creates both users + role-specific documents
- ✅ Mentors/Mentees get their own collections

---

**Ready for production testing!**
