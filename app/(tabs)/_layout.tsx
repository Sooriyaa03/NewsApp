import React from "react";
import { StatusBar } from "react-native";
import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";

export default function TabsLayout() {
  return (
    <>
      {/* Change the status bar color and style */}
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Tabs tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerStyle: styles.headerBackground,
            headerTintColor: styles.headerTintColor,
            headerTitleStyle: styles.headerTitle,
            headerTitleAlign: "center", // Center the title
          }}
        />
        <Tabs.Screen
          name="stock"
          options={{
            title: "Stock",
            headerStyle: styles.headerBackground,
            headerTintColor: styles.headerTintColor,
            headerTitleStyle: styles.headerTitle,
            headerTitleAlign: "center", // Center the title
          }}
        />
        <Tabs.Screen
          name="poll"
          options={{
            title: "Poll",
            headerStyle: styles.headerBackground,
            headerTintColor: styles.headerTintColor,
            headerTitleStyle: styles.headerTitle,
            headerTitleAlign: "center", // Center the title
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: "User",
            headerStyle: styles.headerBackground,
            headerTintColor: styles.headerTintColor,
            headerTitleStyle: styles.headerTitle,
            headerTitleAlign: "center", // Center the title
          }}
        />
      </Tabs>
    </>
  );
}

const styles = {
  headerBackground: {
    backgroundColor: "#1d232e", // Purple background for Home
  },
  headerTintColor: "#bfc2c6", // White text/icons for all headers
  headerTitle: {
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: "Roboto-Medium", // Change this to your desired font family
  },
};
