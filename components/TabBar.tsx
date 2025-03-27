import { View, LayoutChangeEvent, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBarButton from "./TabBarButton";
import { useState } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({ height: 20, width: 10 });

  const buttonWidth = dimensions.width ? dimensions.width / state.routes.length : 0;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  return (
    <View onLayout={onTabbarLayout} style={styles.tabbar}>
      {/* Animated Active Tab Indicator */}
      {buttonWidth > 0 && (
        <Animated.View
          style={[
            animatedStyle,
            {
              position: "absolute",
              backgroundColor: "black",
              borderRadius: 30,
              marginHorizontal: 12,
              height: dimensions.height - 15,
              width: buttonWidth - 25,
            },
          ]}
        />
      )}

      {/* Render Tabs */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          // Animate indicator with proper spring values
          tabPositionX.value = withSpring(buttonWidth * index, {
            damping: 15, // Adjust for smoothness
            stiffness: 120, // Adjust for responsiveness
          });

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? "#FFF" : "#222"}
            label={label}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a3241",
    marginHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 35,
    elevation: 10,
  },
});
