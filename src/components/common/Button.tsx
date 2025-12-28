import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import { COLORS, commonStyles } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}) => {
  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: COLORS.darkGray,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          paddingVertical: 0,
          paddingHorizontal: 0,
        };
      case 'primary':
      default:
        return {
          backgroundColor: COLORS.primary,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
        return { color: COLORS.primary };
      case 'text':
        return { color: COLORS.primary, ...commonStyles.text };
      case 'secondary':
        return { color: COLORS.white };
      case 'primary':
      default:
        return { color: COLORS.white };
    }
  };

  return (
    <TouchableOpacity
      style={[
        commonStyles.button,
        getButtonStyle(),
        fullWidth && { width: '100%' },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'secondary' ? COLORS.white : COLORS.primary} 
          size="small" 
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon} </>}
          <Text style={[commonStyles.buttonText, getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && <>{' '}{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
