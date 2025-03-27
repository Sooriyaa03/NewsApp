import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, Alert } from "react-native";
import * as Location from "expo-location";

const UserSettings = () => {
  const [deviceNotifications, setDeviceNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [location, setLocation] = useState("Not Detected");

  const detectLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to detect location.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);
      
      if (reverseGeocode.length > 0 && reverseGeocode[0].country) {
        setLocation(reverseGeocode[0].country);
      } else {
        setLocation("Unknown");
      }
    } catch (error) {
      setLocation("Unknown");
      Alert.alert("Error", "Failed to detect location. Try again later.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>User Settings</Text>
      
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
        <Text>Enable Device Notifications</Text>
        <Switch value={deviceNotifications} onValueChange={setDeviceNotifications} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
        <Text>Enable Email Notifications</Text>
        <Switch value={emailNotifications} onValueChange={setEmailNotifications} />
      </View>

      <Text style={{ marginBottom: 10 }}>Detected Country:</Text>
      <View style={{ padding: 10, borderWidth: 1, borderColor: "gray", borderRadius: 5, backgroundColor: "white" }}>
        <Text>{location}</Text>
      </View>

      <TouchableOpacity
        style={{ marginTop: 20, backgroundColor: "blue", padding: 10, borderRadius: 5, alignItems: "center" }}
        onPress={detectLocation}
      >
        <Text style={{ color: "white" }}>Auto Detect Location</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserSettings;
