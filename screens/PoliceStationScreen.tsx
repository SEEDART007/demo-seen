import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyC0erQrMeHOQsm8u2Frvd9UM8PtfC57e6w'; // Replace this with your real key

const PoliceStationScreen = () => {
  const [region, setRegion] = useState(null);
  const [policeStations, setPoliceStations] = useState([]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('Location permission denied');
            return;
          }
        }

        Geolocation.getCurrentPosition(
          (position) => {
              console.log('Location:', position);
            const { latitude, longitude } = position.coords;
            const region = {
              latitude,
              longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };
            setRegion(region);
            fetchPoliceStations(latitude, longitude);
          },
          (error) => console.error(error),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      } catch (err) {
        console.warn(err);
      }
    };

    getLocation();
  }, []);

  const fetchPoliceStations = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100000&type=police&key=${GOOGLE_MAPS_API_KEY}`
      );
      console.log("Nearby police stations:", response.data.results);
      setPoliceStations(response.data.results);
    } catch (error) {
      console.error('Error fetching police stations:', error);
    }
  };

  if (!region) {
    return (
      <View style={styles.centered}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation={true}>
        {policeStations.map((station, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: station.geometry.location.lat,
              longitude: station.geometry.location.lng,
            }}
            title={station.name}
            description={station.vicinity}
          />
        ))}
      </MapView>
    </View>
  );
};

export default PoliceStationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
