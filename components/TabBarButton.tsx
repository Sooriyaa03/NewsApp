import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { icon } from "@/constants/icon";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export default function TabBarButton({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  label,
}: {
  onPress: Function;
  onLongPress: Function;
  isFocused: boolean;
  routeName: string;
  color: string;
  label: string;
}) {
  const scale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      damping: 10, // Adjust for smoothness
      stiffness: 100, // Adjust for responsiveness
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.2]) }],
      top: interpolate(scale.value, [0, 1], [0, 9]),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scale.value, [0, 1], [1, 0]),
    };
  });

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.tabbarItem}>
      <Animated.View style={animatedIconStyle}>
        {icon[routeName] && icon[routeName]({ color: isFocused ? "beige" : "#bfc2c6" })}
      </Animated.View>
      <Animated.Text style={[{ color: isFocused ? "#673ab7" : "#bfc2c6", fontSize: 12 }, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
