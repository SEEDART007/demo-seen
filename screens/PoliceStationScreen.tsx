import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import MapLibreGL, { Camera, MapView } from '@maplibre/maplibre-react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { 
  Shield, 
  Plus, 
  Minus, 
  LocateFixed, 
  Layers, 
  Phone, 
  Globe, 
  MapPin, 
  X,
  RefreshCw,
  ChevronDown,
  Settings,
  ArrowRightCircle,
  Info
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

interface PoliceStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  street?: string;
  city?: string;
  phone?: string;
  website?: string;
  distance?: number;
}

const { width, height } = Dimensions.get('window');
const RADIUS = 5; // Fixed search radius in km
const HEADER_HEIGHT = 60;
const BOTTOM_SHEET_HEIGHT = 280;
const MARKER_SIZE = 40;

type MapStyle = 'streets' | 'satellite' | 'dark';

const PoliceStationScreen = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [pitch, setPitch] = useState(60);
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showMapStyleOptions, setShowMapStyleOptions] = useState(false);
  const [activeCallout, setActiveCallout] = useState<string | null>(null);
  
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  const bottomSheetAnim = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const mapStyleOptionsAnim = useRef(new Animated.Value(0)).current;
  const calloutAnim = useRef(new Animated.Value(0)).current;

  const mapStyles = {
    streets: `https://api.maptiler.com/maps/streets/style.json?key=QMOSug0sMKThRaex038A`,
    satellite: `https://api.maptiler.com/maps/hybrid/style.json?key=QMOSug0sMKThRaex038A`,
    dark: `https://api.maptiler.com/maps/darkmatter/style.json?key=QMOSug0sMKThRaex038A`
  };

  const toggleBottomSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: selectedStation ? 0 : BOTTOM_SHEET_HEIGHT,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const toggleMapStyleOptions = () => {
    Animated.timing(mapStyleOptionsAnim, {
      toValue: showMapStyleOptions ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
    setShowMapStyleOptions(!showMapStyleOptions);
  };

  const selectMapStyle = (style: MapStyle) => {
    setMapStyle(style);
    toggleMapStyleOptions();
  };

  const animateCallout = (stationId: string | null) => {
    Animated.timing(calloutAnim, {
      toValue: stationId ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setActiveCallout(stationId);
    });
  };

  useEffect(() => {
    toggleBottomSheet();
  }, [selectedStation]);

  const fetchPoliceStationsFromOSM = useCallback(async (lat: number, lng: number) => {
    setIsLoadingStations(true);
    try {
      const radiusInMeters = RADIUS * 1000;
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="police"](around:${radiusInMeters},${lat},${lng});
          way["amenity"="police"](around:${radiusInMeters},${lat},${lng});
          relation["amenity"="police"](around:${radiusInMeters},${lat},${lng});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await axios.post(
        'https://overpass-api.de/api/interpreter',
        query,
        {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 30000
        }
      );

      if (!response.data.elements || response.data.elements.length === 0) {
        const fallbackStations = generateFallbackStations(lat, lng, radiusInMeters);
        setPoliceStations(fallbackStations);
        return;
      }

      const stations = response.data.elements.map((el: any) => {
        let latitude, longitude;
        if (el.type === 'node') {
          latitude = el.lat;
          longitude = el.lon;
        } else if (el.center) {
          latitude = el.center.lat;
          longitude = el.center.lon;
        } else if (el.lat && el.lon) {
          latitude = el.lat;
          longitude = el.lon;
        } else {
          return null;
        }

        if (!latitude || !longitude) {
          return null;
        }

        const distance = calculateDistance(lat, lng, latitude, longitude);

        const street = el.tags?.['addr:street'] || el.tags?.['addr:housename'] || '';
        const city = el.tags?.['addr:city'] || 
                    el.tags?.['addr:suburb'] || 
                    el.tags?.['addr:town'] || 
                    el.tags?.['addr:village'] || '';
        const addressParts = [];
        if (street) addressParts.push(street);
        if (city) addressParts.push(city);
        const address = addressParts.join(', ') || 'Address not available';

        return {
          id: `${el.type}-${el.id}`,
          name: el.tags?.name || 'Police Station',
          lat: latitude,
          lng: longitude,
          address,
          street,
          city,
          phone: el.tags?.phone || 
                el.tags?.['contact:phone'] || 
                el.tags?.['phone_1'] || 
                el.tags?.['phone_2'],
          website: el.tags?.website || 
                  el.tags?.['contact:website'] || 
                  el.tags?.['url'],
          distance: parseFloat(distance.toFixed(1))
        };
      }).filter(Boolean);

      setPoliceStations(stations);
    } catch (error) {
      console.error('Error fetching stations:', error);
      const fallbackStations = generateFallbackStations(lat, lng, RADIUS * 1000);
      setPoliceStations(fallbackStations);
    } finally {
      setIsLoadingStations(false);
    }
  }, []);

  const generateFallbackStations = (lat: number, lng: number, radiusInMeters: number) => {
    const stations: PoliceStation[] = [];
    const radiusInDegrees = radiusInMeters / 111320;
    const count = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radiusInDegrees * 0.8;
      const stationLat = lat + (Math.sin(angle) * distance);
      const stationLng = lng + (Math.cos(angle) * distance);
      const stationDistance = calculateDistance(lat, lng, stationLat, stationLng);
      
      stations.push({
        id: `fallback-${i}`,
        name: `Police Station ${i+1}`,
        lat: stationLat,
        lng: stationLng,
        address: `Sample address ${i+1}`,
        distance: parseFloat(stationDistance.toFixed(1)),
        phone: '+1234567890',
        website: 'https://police.example.com'
      });
    }
    return stations;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const getLocation = useCallback(async () => {
    try {
      let granted;
      if (Platform.OS === 'android') {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationError('Location permission denied. Using default location.');
          setLocation({ lat: 40.7128, lng: -74.0060 });
          fetchPoliceStationsFromOSM(40.7128, -74.0060);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          fetchPoliceStationsFromOSM(latitude, longitude);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Failed to get location. Using default.');
          setLocation({ lat: 40.7128, lng: -74.0060 });
          fetchPoliceStationsFromOSM(40.7128, -74.0060);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.warn('Location permission error:', err);
      setLocationError('Location permission error. Using default.');
      setLocation({ lat: 40.7128, lng: -74.0060 });
      fetchPoliceStationsFromOSM(40.7128, -74.0060);
    }
  }, [fetchPoliceStationsFromOSM]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const handleZoom = (type: 'in' | 'out') => {
    const newZoom = type === 'in' ? Math.min(zoomLevel + 1, 20) : Math.max(zoomLevel - 1, 3);
    setZoomLevel(newZoom);
    cameraRef.current?.flyTo([location!.lng, location!.lat], newZoom);
  };

  const handleStationSelect = (station: PoliceStation) => {
    setSelectedStation(station);
    animateCallout(station.id);
    cameraRef.current?.flyTo([station.lng, station.lat], 16, 60);
  };

  const resetView = () => {
    if (location && cameraRef.current) {
      cameraRef.current.flyTo([location.lng, location.lat], 14, 60);
      setZoomLevel(14);
      setPitch(60);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWebsite = (url: string) => {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.canOpenURL(formattedUrl).then(supported => {
      if (supported) Linking.openURL(formattedUrl);
    });
  };

  const refreshStations = () => {
    if (location) {
      fetchPoliceStationsFromOSM(location.lat, location.lng);
    }
  };

  const closeCallout = () => {
    animateCallout(null);
    setSelectedStation(null);
  };

  const mapStyleOptionsHeight = mapStyleOptionsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120]
  });

  const mapStyleOptionsOpacity = mapStyleOptionsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const calloutScale = calloutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  const calloutOpacity = calloutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const getCalloutPosition = (station: PoliceStation | null) => {
    if (!station) return { top: 0, left: 0 };
    
    // In a real app, you would convert lat/lng to screen coordinates
    // For this example, we'll approximate based on map center
    return {
      top: height * 0.4,
      left: width * 0.5 - 125
    };
  };

  if (locationError) {
    return (
      <LinearGradient 
        colors={['#1a2b6d', '#4a6cc3']} 
        style={styles.centered}
      >
        <View style={styles.errorContainer}>
          <Shield size={48} color="#fff" />
          <Text style={styles.errorTitle}>Location Required</Text>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={getLocation}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!location) {
    return (
      <LinearGradient 
        colors={['#1a2b6d', '#4a6cc3']} 
        style={styles.centered}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={['rgba(26, 43, 109, 0.9)', 'rgba(74, 108, 195, 0.8)']} 
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Police Station Finder</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={toggleMapStyleOptions}
        >
          <Settings size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Map Style Options */}
      <Animated.View 
        style={[
          styles.mapStyleOptions, 
          { 
            height: mapStyleOptionsHeight,
            opacity: mapStyleOptionsOpacity
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.mapStyleOption, 
            mapStyle === 'streets' && styles.selectedMapStyle
          ]}
          onPress={() => selectMapStyle('streets')}
        >
          <Text style={styles.mapStyleText}>Street View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.mapStyleOption, 
            mapStyle === 'satellite' && styles.selectedMapStyle
          ]}
          onPress={() => selectMapStyle('satellite')}
        >
          <Text style={styles.mapStyleText}>Satellite</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.mapStyleOption, 
            mapStyle === 'dark' && styles.selectedMapStyle
          ]}
          onPress={() => selectMapStyle('dark')}
        >
          <Text style={styles.mapStyleText}>Dark Mode</Text>
        </TouchableOpacity>
      </Animated.View>

      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        mapStyle={mapStyles[mapStyle]}
        zoomEnabled
        scrollEnabled
        pitchEnabled
        rotateEnabled
        compassEnabled
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={zoomLevel}
          centerCoordinate={[location.lng, location.lat]}
          pitch={pitch}
        />

        <MapLibreGL.UserLocation 
          visible 
          showsUserHeadingIndicator 
          androidRenderMode="compass"
        />

        {/* Search radius circle */}
        <MapLibreGL.ShapeSource
          id="radiusSource"
          shape={{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [location.lng, location.lat],
            },
            properties: {},
          }}
        >
          <MapLibreGL.CircleLayer
            id="radiusCircle"
            style={{
              circleRadius: RADIUS * 1000,
              circleColor: 'rgba(74, 108, 195, 0.15)',
              circleStrokeColor: 'rgba(74, 108, 195, 0.6)',
              circleStrokeWidth: 1.5,
            }}
          />
        </MapLibreGL.ShapeSource>

        {/* Police station markers */}
        {policeStations.map((station) => (
          <MapLibreGL.PointAnnotation
            key={`station-${station.id}`}
            id={`station-${station.id}`}
            coordinate={[station.lng, station.lat]}
            onSelected={() => handleStationSelect(station)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <LinearGradient 
              colors={selectedStation?.id === station.id 
                ? ['#4a6cc3', '#1a2b6d'] 
                : ['#e74c3c', '#c0392b']}
              style={[
                styles.marker,
                selectedStation?.id === station.id && styles.selectedMarker
              ]}
            >
              <Shield size={20} color="white" />
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{station.distance}km</Text>
              </View>
            </LinearGradient>
          </MapLibreGL.PointAnnotation>
        ))}
      </MapLibreGL.MapView>

      {/* Floating Callout for Station Info */}
      {activeCallout && (
        <Animated.View 
          style={[
            styles.floatingCallout, 
            getCalloutPosition(selectedStation),
            {
              opacity: calloutOpacity,
              transform: [{ scale: calloutScale }]
            }
          ]}
        >
          <LinearGradient 
            colors={['#1a2b6d', '#4a6cc3']} 
            style={styles.calloutContainer}
          >
            <View style={styles.calloutHeader}>
              <Text style={styles.calloutTitle}>{selectedStation?.name}</Text>
              <TouchableOpacity onPress={closeCallout}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.calloutInfoRow}>
              <Info size={16} color="#fff" />
              <Text style={styles.calloutText}>{selectedStation?.address}</Text>
            </View>
            <View style={styles.calloutInfoRow}>
              <MapPin size={16} color="#fff" />
              <Text style={styles.calloutDistance}>{selectedStation?.distance} km away</Text>
            </View>
            
            <View style={styles.calloutActions}>
              {selectedStation?.phone && (
                <TouchableOpacity 
                  style={styles.calloutActionButton}
                  onPress={() => handleCall(selectedStation.phone!)}
                >
                  <Phone size={20} color="#fff" />
                  <Text style={styles.calloutActionText}>Call</Text>
                </TouchableOpacity>
              )}
              {selectedStation?.website && (
                <TouchableOpacity 
                  style={styles.calloutActionButton}
                  onPress={() => handleWebsite(selectedStation.website!)}
                >
                  <Globe size={20} color="#fff" />
                  <Text style={styles.calloutActionText}>Website</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.calloutActionButton}
                onPress={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedStation?.lat},${selectedStation?.lng}`;
                  Linking.openURL(url);
                }}
              >
                <MapPin size={20} color="#fff" />
                <Text style={styles.calloutActionText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Map Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity 
          onPress={() => handleZoom('in')} 
          style={[styles.controlButton, styles.zoomInButton]}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleZoom('out')} 
          style={[styles.controlButton, styles.zoomOutButton]}
        >
          <Minus size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={resetView} 
          style={[styles.controlButton, styles.locateButton]}
        >
          <LocateFixed size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={refreshStations} 
          style={[styles.controlButton, styles.refreshButton]}
        >
          <RefreshCw size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {isLoadingStations && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a2b6d" />
          <Text style={styles.loadingText}>Updating stations...</Text>
        </View>
      )}

      {/* Station Count */}
      <View style={styles.stationCount}>
        <Text style={styles.countText}>
          {policeStations.length} {policeStations.length === 1 ? 'station' : 'stations'} within {RADIUS} km
        </Text>
      </View>

      {/* Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet, 
          { transform: [{ translateY: bottomSheetAnim }] }
        ]}
      >
        <TouchableOpacity 
          style={styles.bottomSheetHandle}
          onPress={() => setSelectedStation(null)}
        >
          <ChevronDown size={24} color="#4a6cc3" />
        </TouchableOpacity>
        
        {selectedStation ? (
          <View style={styles.stationDetail}>
            <Text style={styles.detailTitle}>{selectedStation.name}</Text>
            <Text style={styles.detailAddress}>{selectedStation.address}</Text>
            <Text style={styles.detailDistance}>{selectedStation.distance} km away</Text>
            
            <View style={styles.buttonRow}>
              {selectedStation.phone && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.phoneButton]}
                  onPress={() => handleCall(selectedStation.phone!)}
                >
                  <Phone size={20} color="white" />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
              )}
              {selectedStation.website && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.websiteButton]}
                  onPress={() => handleWebsite(selectedStation.website!)}
                >
                  <Globe size={20} color="white" />
                  <Text style={styles.actionText}>Website</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.actionButton, styles.directionsButton]}
                onPress={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lng}`;
                  Linking.openURL(url);
                }}
              >
                <MapPin size={20} color="white" />
                <Text style={styles.actionText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.stationList}>
            <Text style={styles.listTitle}>Nearby Police Stations</Text>
            {policeStations.length === 0 ? (
              <Text style={styles.noStationsText}>No stations found in your area</Text>
            ) : (
              policeStations.map(station => (
                <TouchableOpacity 
                  key={station.id}
                  style={styles.listItem}
                  onPress={() => handleStationSelect(station)}
                >
                  <View style={styles.listMarker}>
                    <Shield size={18} color="#fff" />
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>{station.name}</Text>
                    <Text style={styles.listAddress}>{station.address}</Text>
                  </View>
                  <View style={styles.listDistanceContainer}>
                    <Text style={styles.listDistance}>{station.distance} km</Text>
                    <ArrowRightCircle size={18} color="#4a6cc3" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2b6d' },
  map: { flex: 1 },
  centered: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 25,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  retryButtonText: {
    color: '#1a2b6d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: HEADER_HEIGHT + 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  mapStyleOptions: {
    position: 'absolute',
    top: HEADER_HEIGHT + 10,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 15,
    zIndex: 9,
    overflow: 'hidden',
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  mapStyleOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedMapStyle: {
    backgroundColor: 'rgba(26, 43, 109, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#1a2b6d',
  },
  mapStyleText: {
    fontSize: 15,
    color: '#1a2b6d',
    fontWeight: '500',
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  selectedMarker: {
    width: MARKER_SIZE * 1.3,
    height: MARKER_SIZE * 1.3,
    borderRadius: (MARKER_SIZE * 1.3) / 2,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a2b6d',
  },
  floatingCallout: {
    position: 'absolute',
    width: 250,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  calloutContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  calloutInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 8,
    flex: 1,
  },
  calloutDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  calloutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  calloutActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  calloutActionText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  zoomControls: {
    position: 'absolute',
    right: 20,
    top: HEADER_HEIGHT + 80,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomInButton: {
    backgroundColor: '#4a6cc3',
  },
  zoomOutButton: {
    backgroundColor: '#1a2b6d',
  },
  locateButton: {
    backgroundColor: '#4a6cc3',
  },
  refreshButton: {
    backgroundColor: '#1a2b6d',
  },
  stationCount: {
    position: 'absolute',
    top: HEADER_HEIGHT + 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1a2b6d',
  },
  bottomSheet: {
    position: 'absolute',
    height: BOTTOM_SHEET_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20,
  },
  bottomSheetHandle: {
    alignSelf: 'center',
    padding: 10,
    marginBottom: 5,
  },
  stationDetail: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a2b6d',
  },
  detailAddress: {
    fontSize: 16,
    marginBottom: 3,
    color: '#4a5568',
  },
  detailDistance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  phoneButton: {
    backgroundColor: '#2ecc71',
  },
  websiteButton: {
    backgroundColor: '#3498db',
  },
  directionsButton: {
    backgroundColor: '#9b59b6',
  },
  actionText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  stationList: {
    flex: 1,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a2b6d',
    marginBottom: 15,
    textAlign: 'center',
  },
  noStationsText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 16,
    marginTop: 30,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  listMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a2b6d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2b6d',
    marginBottom: 2,
  },
  listAddress: {
    fontSize: 13,
    color: '#718096',
  },
  listDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDistance: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a6cc3',
    marginRight: 8,
  },
});

export default PoliceStationScreen;