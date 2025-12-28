import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { navigationTheme, COLORS, SPACING } from '../theme';

// Import screens with type assertions to handle default exports
const OnboardingFlow = require('../screens/Onboarding/OnboardingFlow').default;
const LoginScreen = require('../screens/Auth/LoginScreen').default;
const RegisterScreen = require('../screens/Auth/RegisterScreen').default;
const ForgotPasswordScreen = require('../screens/Auth/ForgotPasswordScreen').default;
const SwipeScreen = require('../screens/Swipe/SwipeScreen').default;
const ProfileScreen = require('../screens/Profile/ProfileScreen').default;
const EditProfileScreen = require('../screens/Profile/EditProfileScreen').default;
const SettingsScreen = require('../screens/Profile/SettingsScreen').default;
const ChatListScreen = require('../screens/Chat/ChatListScreen').default;
const ChatScreen = require('../screens/Chat/ChatScreen').default;
const FeedScreen = require('../screens/Feed/FeedScreen').default;
const MentorProfileScreen = require('../screens/Profile/MentorProfileScreen').default;

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
        options={{ title: 'Discover' }}
      />
      <Tab.Screen 
        name="ChatList" 
        component={ChatListScreen} 
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{ title: 'Feed' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if it's the first launch
        const firstLaunch = await AsyncStorage.getItem('@firstLaunch');
        setIsFirstLaunch(firstLaunch === null);
        
        // Check if user has a stored token (for development/testing without Firebase)
        const userToken = await AsyncStorage.getItem('@userToken');
        setIsAuthenticated(!!userToken);
        setIsLoading(false);
        
        // TODO: Replace with actual Firebase auth when ready:
        /*
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setIsAuthenticated(!!user);
          setIsLoading(false);
        });
        
        return () => unsubscribe();
        */
      } catch (error) {
        console.error('Error checking auth state:', error);
        // Set as unauthenticated on error to show auth screens
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={isFirstLaunch ? 'Onboarding' : (isAuthenticated ? 'Main' : 'Auth')}
      >
        {/* Always render Onboarding for first launch */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingFlow} 
          options={{ animationEnabled: false }}
        />
        
        {/* Auth Screens - always available */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ animationEnabled: true }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ animationEnabled: true }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen} 
          options={{ animationEnabled: true }}
        />
        
        {/* Auth Stack - for non-first-launch navigation */}
        <Stack.Screen name="Auth" component={AuthStack} />
        
        {/* Main App */}
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* Authenticated-only screens */}
        <Stack.Screen 
          name="MentorProfile" 
          component={MentorProfileScreen} 
          options={{ headerShown: true, title: 'Mentor Profile' }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ headerShown: true, title: 'Edit Profile' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ headerShown: true, title: 'Settings' }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={({ route }) => ({
            headerShown: true,
            title: route.params?.recipientName || 'Chat',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
