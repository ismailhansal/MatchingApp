import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthState } from './useAuthState';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

/**
 * Hook to show profile completion reminder 5 seconds after account creation
 */
export const useProfileCompletion = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [user] = useAuthState();
  const hasShownAlert = useRef(false);

  useEffect(() => {
    if (!user || hasShownAlert.current) return;

    const checkAndShowAlert = async () => {
      try {
        // Check if user just created an account
        const newAccountFlag = await AsyncStorage.getItem(`newAccount_${user.uid}`);
        
        if (newAccountFlag === 'true') {
          // Wait 5 seconds, then show alert
          const timeout = setTimeout(() => {
            hasShownAlert.current = true;
            
            Alert.alert(
              'Complete Your Profile',
              'Help us match you better by completing your profile information.',
              [
                {
                  text: 'Complete Now',
                  onPress: () => {
                    navigation.navigate('EditProfile');
                    // Clear the flag after showing alert
                    AsyncStorage.removeItem(`newAccount_${user.uid}`);
                  },
                },
                {
                  text: 'Later',
                  onPress: () => {
                    // Clear the flag after showing alert
                    AsyncStorage.removeItem(`newAccount_${user.uid}`);
                  },
                },
              ]
            );
          }, 5000);

          return () => clearTimeout(timeout);
        }
      } catch (error) {
        console.error('Error checking for new account:', error);
      }
    };

    checkAndShowAlert();
  }, [user, navigation]);
};
