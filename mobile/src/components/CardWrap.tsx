import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';

interface CardWrapProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CardWrap({ children, onPress, style }: CardWrapProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const { theme } = useAppTheme();

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[
        {
          backgroundColor: theme.surf2,
          borderWidth: 1,
          borderColor: theme.bdr,
          borderRadius: 10,
          overflow: 'hidden',
        },
        { transform: [{ scale }] },
        style,
      ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
