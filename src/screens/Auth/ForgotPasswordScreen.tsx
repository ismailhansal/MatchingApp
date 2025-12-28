import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, SPACING, commonStyles } from '../../theme';
import Button from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const handleResetPassword = () => {
    if (!email) {
      // Show error message
      return;
    }
    
    setIsLoading(true);
    
    // TODO: Implement password reset logic with Firebase Auth
    console.log('Reset password for:', email);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 1500);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={commonStyles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Ionicons name="lock-closed" size={60} color={COLORS.primary} />
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              {emailSent 
                ? 'Check your email for a password reset link.'
                : 'Enter your email address and we\'ll send you a link to reset your password.'}
            </Text>
          </View>

          {!emailSent ? (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={COLORS.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Button
                title="Send Reset Link"
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={!email}
                fullWidth
                style={styles.resetButton}
              />
            </View>
          ) : (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={60} color={COLORS.primary} style={styles.successIcon} />
              <Text style={styles.successText}>
                We've sent a password reset link to {email}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.backToLoginText}>
                <Ionicons name="arrow-back" size={16} color={COLORS.primary} />{' '}
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  inputIcon: {
    marginLeft: SPACING.md,
  },
  input: {
    flex: 1,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
  },
  resetButton: {
    marginTop: SPACING.sm,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
