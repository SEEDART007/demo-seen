// DangerZoneScreen.jsx
import React, { useEffect, useState } from "react";
import { View, Text, PermissionsAndroid, Platform, StyleSheet } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import PushNotification from "react-native-push-notification";
import { getDistance } from "geolib";

// Predefined static coordinates
const dangerZones = [
  { id: 1, latitude: 37.7749, longitude: -122.4194, radius: 200, name: "Restricted Area 1" },
  { id: 2, latitude: 37.7800, longitude: -122.4200, radius: 150, name: "High Crime Area" },
  { id: 3, latitude: 37.421998, longitude: -122.084000, radius: 150, name: "High Crime Area" },
];

export default function DangerZoneScreen() {
  const [lastZoneId, setLastZoneId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    requestPermissions();
    setupNotifications();

    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        const zone = checkDangerZone(latitude, longitude);

        if (zone && zone.id !== lastZoneId) {
          // New zone entered
          setLastZoneId(zone.id);
          PushNotification.localNotification({
            channelId: "danger-zone-alerts",
            title: "🚨 Danger Zone Alert",
            message: `You are inside ${zone.name}!`,
            playSound: true,
            soundName: "default",
          });
        } else if (!zone && lastZoneId !== null) {
          // Left the previous zone
          setLastZoneId(null);
          PushNotification.localNotification({
            channelId: "danger-zone-alerts",
            title: "✅ Safe Zone",
            message: "You have left the danger zone",
          });
        }
      },
      (error) => {
        console.log("Location error:", error);
        setError(error.message);
      },
      { 
        enableHighAccuracy: true, 
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000 
      }
    );

    return () => Geolocation.clearWatch(watchId);
  }, [lastZoneId]);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location to detect danger zones.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError("Location permission denied");
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const setupNotifications = () => {
    PushNotification.createChannel(
      {
        channelId: "danger-zone-alerts",
        channelName: "Danger Zone Alerts",
        channelDescription: "Notifications for danger zone detection",
        playSound: true,
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );

    PushNotification.configure({
      onRegister: function(token) {
        console.log("TOKEN:", token);
      },
      onNotification: function(notification) {
        console.log("NOTIFICATION:", notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  };

  const checkDangerZone = (userLat, userLng) => {
    for (let zone of dangerZones) {
      const distance = getDistance(
        { latitude: userLat, longitude: userLng },
        { latitude: zone.latitude, longitude: zone.longitude }
      );
      if (distance <= zone.radius) {
        return zone;
      }
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danger Zone Tracker</Text>
      <Text style={styles.info}>
        Move around and you will be notified if you enter a danger zone.
      </Text>
      
      {currentLocation && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Current Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
      
      {lastZoneId && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            WARNING: You are in {dangerZones.find(z => z.id === lastZoneId).name}
          </Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  info: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color: "#555",
  },
  locationContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#333",
  },
  warningContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ffebee",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ef9a9a",
  },
  warningText: {
    fontSize: 16,
    color: "#d32f2f",
    fontWeight: "bold",
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff3e0",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ffcc80",
  },
  errorText: {
    fontSize: 14,
    color: "#e65100",
  },
});