import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

const color = '#664ac1';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: 'Signup',
        }}
      />
    </Tabs>
  );
}