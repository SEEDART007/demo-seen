import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import { getDistance } from 'geolib';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Buffer } from 'buffer';

const audioRecorderPlayer = new AudioRecorderPlayer();
const DEEPGRAM_API_KEY = '439e9d68b1482b32378dd2f10c957276d906430f';

// Danger zones configuration
const dangerZones = [
  { id: 1, latitude: 37.7749, longitude: -122.4194, radius: 200, name: "Restricted Area 1" },
  { id: 2, latitude: 37.7800, longitude: -122.4200, radius: 150, name: "High Crime Area" },
  { id: 3, latitude: 37.421998, longitude: -122.084000, radius: 150, name: "High Crime Area" },
];

const HelpDetectionScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [triggerWord, setTriggerWord] = useState('help');
  const [hasStarted, setHasStarted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stopFlag = useRef(false);

  useEffect(() => {
    requestPermissions();
    setupNotifications();
    
    const loadContacts = async () => {
      try {
        const savedContacts = await AsyncStorage.getItem('@emergency_contacts');
        if (savedContacts !== null) {
          setContacts(JSON.parse(savedContacts));
        }
      } catch (e) {
        console.error('Failed to load contacts', e);
      }
    };
    
    loadContacts();

    const loadTriggerWord = async () => {
      try {
        const word = await AsyncStorage.getItem('@trigger_word');
        if (word) setTriggerWord(word);
      } catch (e) {
        console.error('Failed to load trigger word', e);
      }
    };
    
    loadTriggerWord();

    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        const zone = checkDangerZone(latitude, longitude);

        if (zone && (!currentZone || zone.id !== currentZone.id) && !manualOverride) {
          // Entered new danger zone
          setCurrentZone(zone);
          startRecording();
          PushNotification.localNotification({
            channelId: "danger-zone-alerts",
            title: "🚨 Entered Danger Zone",
            message: `Auto-recording enabled in ${zone.name}`,
          });
        } else if (!zone && currentZone && !manualOverride) {
          // Left danger zone
          setCurrentZone(null);
          stopRecording();
          PushNotification.localNotification({
            channelId: "danger-zone-alerts",
            title: "✅ Safe Zone",
            message: "Left danger zone. Recording stopped.",
          });
        }
      },
      (error) => console.log("Location error:", error),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    return () => {
      Geolocation.clearWatch(watchId);
      if (isRecording) stopRecording();
    };
  }, [currentZone, manualOverride]);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        const granted = Object.values(grants).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );
        setHasPermission(granted);
        return granted;
      }
      return true;
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  };

  const setupNotifications = () => {
    PushNotification.createChannel(
      {
        channelId: "danger-zone-alerts",
        channelName: "Danger Zone Alerts",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  };

  const checkDangerZone = (userLat, userLng) => {
    for (let zone of dangerZones) {
      const distance = getDistance(
        { latitude: userLat, longitude: userLng },
        { latitude: zone.latitude, longitude: zone.longitude }
      );
      if (distance <= zone.radius) return zone;
    }
    return null;
  };

  const startRecording = async () => {
    if (stopFlag.current) return;
    
    try {
      setHasStarted(true);
      stopFlag.current = false;
      startRecordingLoop();
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const startRecordingLoop = async () => {
    const filePath = `${RNFS.DocumentDirectoryPath}/help-detect.m4a`;
    
    while (!stopFlag.current) {
      try {
        const exists = await RNFS.exists(filePath);
        if (exists) await RNFS.unlink(filePath);

        await audioRecorderPlayer.startRecorder(filePath);
        setIsRecording(true);

        await new Promise((res) => setTimeout(res, 5000));

        await audioRecorderPlayer.stopRecorder();
        setIsRecording(false);

        const audioData = await RNFS.readFile(filePath, 'base64');
        const audioBuffer = Buffer.from(audioData, 'base64');

        const response = await axios.post(
          'https://api.deepgram.com/v1/listen',
          audioBuffer,
          {
            headers: {
              'Content-Type': 'audio/m4a',
              Authorization: `Token ${DEEPGRAM_API_KEY}`,
            },
          }
        );

        const transcript = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
        console.log('Transcript:', transcript);

        if (
          transcript &&
          triggerWord &&
          transcript.toLowerCase().includes(triggerWord.toLowerCase())
        ) {
          Alert.alert('🆘 Trigger Detected!', `Detected the word "${triggerWord}" in speech.`);
          stopFlag.current = true;
          setHasStarted(false);
          sendEmergencySMS();
          break;
        }
      } catch (err) {
        console.error('Recording loop error:', err);
        setIsRecording(false);
        setHasStarted(false);
        break;
      }
    }
  };

  const stopRecording = async () => {
    try {
      stopFlag.current = true;
      await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      setManualOverride(false);
    } catch (err) {
      console.error('Stop recording error:', err);
    } finally {
      stopFlag.current = false;
    }
  };

  const sendEmergencySMS = async () => {
    if (contacts.length === 0) {
      Alert.alert('⚠️ No Contacts', 'Please add at least one contact.');
      return;
    }

    try {
      console.log('📡 Getting location...');
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          const message = `🆘 Emergency! Trigger word "${triggerWord}" detected.\nLocation: ${mapsUrl}`;

          console.log('📡 Sending POST request to server...');
          const response = await axios.post('https://riseup-sms-6262.twil.io/welcome', {
            to: contacts,
            message: message,
          });

          console.log('✅ Server response:', response.data);

          if (response.data.success) {
            Alert.alert('📩 SMS Sent', 'Emergency SMS with location has been sent.');
          } else {
            Alert.alert('❌ Failed', 'Server could not send SMS.');
          }
        },
        (error) => {
          console.error('Location error:', error.message);
          Alert.alert('❌ Location Error', 'Could not get GPS location.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('❌ Error sending SMS:', error.message);
      Alert.alert('❌ Error', 'Failed to contact SMS server.');
    }
  };

  const handleManualStop = () => {
    setManualOverride(true);
    stopRecording();
    Alert.alert(
      "Recording Stopped",
      "Automatic recording will remain off until you leave and re-enter a danger zone",
      [
        { text: "OK" }
      ]
    );
  };

  // Animation for recording pulse
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Safety Guardian</Text>
        <Text style={styles.subtitle}>Auto-protection in danger zones</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Status Indicator */}
        <Animated.View style={[
          styles.statusCircle,
          { transform: [{ scale: pulseAnim }] },
          (currentZone || isRecording) && styles.dangerStatus
        ]}>
          <Text style={styles.statusIcon}>
            {(currentZone || isRecording) ? '⚠️' : '✅'}
          </Text>
          <Text style={styles.statusText}>
            {currentZone ? 'In Danger Zone' : isRecording ? 'Manual Recording' : 'In Safe Area'}
          </Text>
        </Animated.View>

        {/* Current Location */}
        {currentLocation && (
          <View style={styles.locationBox}>
            <Text style={styles.locationText}>
              {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Recording Status */}
        <View style={styles.recordingBox}>
          <Text style={styles.recordingText}>
            {isRecording ? 
              `Audio recording active${currentZone ? ` in ${currentZone.name}` : ''}` : 
              currentZone ? 'Ready to record' : 'Monitoring location'}
          </Text>
          <Text style={styles.triggerWordText}>
            Trigger word: {triggerWord || 'Not set'}
          </Text>
        </View>

        {/* Stop Button (visible only when recording) */}
        {isRecording && (
          <TouchableOpacity 
            style={styles.stopButton}
            onPress={handleManualStop}
          >
            <Text style={styles.stopButtonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {currentZone ? 
            "Automatic protection active" : 
            isRecording ? "Manual recording in progress" : "Will auto-activate in danger zones"}
        </Text>
      </View>

      {!hasPermission && (
        <View style={styles.permissionWarning}>
          <Text style={styles.warningText}>
            Grant location and microphone permissions for full protection
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#e94560',
    fontSize: 14,
    marginTop: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    borderWidth: 3,
    borderColor: '#00c853',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dangerStatus: {
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    borderColor: '#ea4335',
  },
  statusIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  locationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  recordingBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  triggerWordText: {
    color: '#e94560',
    fontSize: 14,
    textAlign: 'center',
  },
  stopButton: {
    backgroundColor: '#ea4335',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    color: '#e94560',
    fontSize: 14,
  },
  permissionWarning: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    alignItems: 'center',
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HelpDetectionScreen;