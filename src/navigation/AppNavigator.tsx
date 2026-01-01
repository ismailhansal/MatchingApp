import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { ActivityIndicator, View, Text } from 'react-native';

import { navigationTheme, COLORS, SPACING } from '../theme';
import { auth } from '../config/firebase';

// Import screens
import OnboardingFlow from '../screens/Onboarding/OnboardingFlow';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import SwipeScreen from '../screens/Swipe/SwipeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import SettingsScreen from '../screens/Profile/SettingsScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import FeedScreen from '../screens/Feed/FeedScreen';
import MentorProfileScreen from '../screens/Profile/MentorProfileScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: { role: 'mentor' | 'mentee' };
  ForgotPassword: undefined;
  Swipe: undefined;
  Profile: { userId?: string };
  EditProfile: undefined;
  Settings: undefined;
  MentorProfile: { userId: string };
  ChatList: undefined;
  Chat: { chatId: string; recipientId: string; recipientName: string };
  Feed: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Define tab bar icon types
type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Swipe') {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === 'ChatList') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label = '';
          if (route.name === 'Swipe') {
            label = 'Discover';
          } else if (route.name === 'ChatList') {
            label = 'Messages';
          } else if (route.name === 'Feed') {
            label = 'Feed';
          } else if (route.name === 'Profile') {
            label = 'Profile';
          }
          return <Text style={{ color, fontSize: 12 }}>{label}</Text>;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.darkGray,
          paddingTop: SPACING.xs,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: SPACING.xs,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Swipe" 
        component={SwipeScreen} 
      />
      <Tab.Screen 
        name="ChatList" 
        component={ChatListScreen} 
      />
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const previousAuthState = useRef<boolean | null>(null);

  useEffect(() => {
    // Subscribe to auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const authenticated = !!user;
      const wasAuthenticated = previousAuthState.current;
      
      console.log('Auth state changed:', {
        authenticated,
        wasAuthenticated,
        userId: user?.uid,
      });
      
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      // Reset navigation when auth state changes (but not on initial load)
      // Only navigate if the state actually changed and navigation is ready
      if (wasAuthenticated !== null && wasAuthenticated !== authenticated && navigationRef.current?.isReady()) {
        console.log('Navigating due to auth state change. Authenticated:', authenticated);
        if (authenticated) {
          // User just logged in - navigate to Main
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          // User just logged out - navigate to Login
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
      
      previousAuthState.current = authenticated;
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? "Main" : "Login"}
      >
        {/* Auth Screens */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
        />
        
        {/* Onboarding - for signup flow */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingFlow}
        />
        
        {/* Main App */}
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* Authenticated-only screens */}
        <Stack.Screen 
          name="MentorProfile" 
          component={MentorProfileScreen}
          options={{ headerShown: true, headerTitle: () => <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '600' }}>Mentor Profile</Text> }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{ headerShown: true, headerTitle: () => <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '600' }}>Edit Profile</Text> }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ headerShown: true, headerTitle: () => <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '600' }}>Settings</Text> }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={({ route }) => ({
            headerShown: true,
            headerTitle: () => <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '600' }}>{route.params?.recipientName || 'Chat'}</Text>,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;