import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { COLORS } from '../../theme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = COLORS.text,
  align = 'left',
  bold = false,
  style,
  children,
  ...rest
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'body':
        return styles.body;
      case 'caption':
        return styles.caption;
      case 'button':
        return styles.button;
      default:
        return styles.body;
    }
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        { color, textAlign: align },
        bold && styles.bold,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default Text;
