import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';

type OnboardingStepProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const OnboardingStep: React.FC<OnboardingStepProps> = ({ children, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      fadeAnim.setValue(0);
      translateY.setValue(20);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});

export default OnboardingStep;
