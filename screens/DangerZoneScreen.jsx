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
import RNFS from 'react-native-fs';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Buffer } from 'buffer';

// Refactored imports - moved hardcoded data to separate files
import { checkDangerZone, formatCoordinates } from '../utils/locationUtils';
import EmergencyService from '../services/emergencyService';
import {
  API_KEYS,
  API_ENDPOINTS,
  AUDIO_CONFIG,
  NOTIFICATION_CONFIG,
  DEFAULTS,
  STORAGE_KEYS,
} from '../constants/config';

const audioRecorderPlayer = new AudioRecorderPlayer();

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
    
    const loadStoredData = async () => {
      try {
        const [savedContacts, savedTriggerWord] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS),
          AsyncStorage.getItem(STORAGE_KEYS.TRIGGER_WORD)
        ]);
        
        if (savedContacts) {
          try {
            const parsedContacts = JSON.parse(savedContacts);
            if (Array.isArray(parsedContacts)) {
              const validContacts = parsedContacts.filter(contact => 
                typeof contact === 'string' && contact.trim().length > 0
              );
              setContacts(validContacts);
            }
          } catch (parseError) {
            setContacts([]);
          }
        }
        
        if (savedTriggerWord && typeof savedTriggerWord === 'string' && savedTriggerWord.trim()) {
          const sanitizedTriggerWord = savedTriggerWord.replace(/[<>"'&]/g, '').trim();
          setTriggerWord(sanitizedTriggerWord || DEFAULTS.TRIGGER_WORD);
        } else {
          setTriggerWord(DEFAULTS.TRIGGER_WORD);
        }
      } catch (error) {
        setContacts([]);
        setTriggerWord(DEFAULTS.TRIGGER_WORD);
      }
    };
    
    loadStoredData();

    // Refactored: use EmergencyService for location watching
    const watchId = EmergencyService.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        // Refactored: use utility function for danger zone checking
        const zone = checkDangerZone(latitude, longitude);

        if (zone && (!currentZone || zone.id !== currentZone.id) && !manualOverride) {
          handleZoneEntry(zone);
        } else if (!zone && currentZone && !manualOverride) {
          handleZoneExit();
        }
      },
      (error) => console.error("Location error:", error)
    );

    return () => {
      EmergencyService.clearWatch(watchId);
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

  // Refactored: use constants for notification setup
  const setupNotifications = () => {
    PushNotification.createChannel(
      {
        channelId: NOTIFICATION_CONFIG.CHANNEL_ID,
        channelName: NOTIFICATION_CONFIG.CHANNEL_NAME,
        importance: NOTIFICATION_CONFIG.IMPORTANCE,
        vibrate: NOTIFICATION_CONFIG.VIBRATE,
      },
      (created) => {}
    );
  };

  // Refactored: extracted zone entry/exit handlers for better organization
  const handleZoneEntry = (zone) => {
    setCurrentZone(zone);
    startRecording();
    PushNotification.localNotification({
      channelId: NOTIFICATION_CONFIG.CHANNEL_ID,
      title: "Entered Danger Zone",
      message: `Auto-recording enabled in ${zone.name}`,
    });
  };

  const handleZoneExit = () => {
    setCurrentZone(null);
    stopRecording();
    PushNotification.localNotification({
      channelId: NOTIFICATION_CONFIG.CHANNEL_ID,
      title: "Safe Zone",
      message: "Left danger zone. Recording stopped.",
    });
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

  // Refactored: use constants for audio configuration
  const startRecordingLoop = async () => {
    if (!API_KEYS.DEEPGRAM) {
      Alert.alert('Configuration Error', 'API key not configured.');
      setIsRecording(false);
      setHasStarted(false);
      return;
    }
    
    const filePath = `${RNFS.DocumentDirectoryPath}/help-detect.${AUDIO_CONFIG.FILE_FORMAT}`;
    
    while (!stopFlag.current) {
      try {
        const exists = await RNFS.exists(filePath);
        if (exists) await RNFS.unlink(filePath);

        await audioRecorderPlayer.startRecorder(filePath);
        setIsRecording(true);

        await new Promise((res) => setTimeout(res, AUDIO_CONFIG.RECORDING_DURATION));

        await audioRecorderPlayer.stopRecorder();
        setIsRecording(false);

        const audioData = await RNFS.readFile(filePath, 'base64');
        const audioBuffer = Buffer.from(audioData, 'base64');

        const response = await axios.post(
          API_ENDPOINTS.DEEPGRAM,
          audioBuffer,
          {
            headers: {
              'Content-Type': AUDIO_CONFIG.CONTENT_TYPE,
              Authorization: `Token ${API_KEYS.DEEPGRAM}`,
            },
            timeout: 10000,
          }
        );

        const transcript = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
        
        if (transcript && triggerWord && transcript.toLowerCase().includes(triggerWord.toLowerCase())) {
          Alert.alert('Trigger Detected', 'Emergency trigger word detected.');
          stopFlag.current = true;
          setHasStarted(false);
          handleTriggerDetected();
          break;
        }
      } catch (err) {
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

  // Refactored: use EmergencyService for sending SMS
  const sendEmergencySMS = async () => {
    if (contacts.length === 0) {
      Alert.alert('⚠️ No Contacts', 'Please add at least one contact.');
      return;
    }

    try {
      const message = `🆘 Emergency! Trigger word "${triggerWord}" detected.`;
      await EmergencyService.sendEmergencySMS(contacts, message);
      Alert.alert('📩 SMS Sent', 'Emergency SMS with location has been sent.');
    } catch (error) {
      console.error('❌ Error sending SMS:', error.message);
      Alert.alert('❌ Error', 'Failed to send emergency SMS.');
    }
  };

  // Handler for when trigger word is detected
  const handleTriggerDetected = () => {
    sendEmergencySMS();
    PushNotification.localNotification({
      channelId: NOTIFICATION_CONFIG.CHANNEL_ID,
      title: "Emergency Triggered!",
      message: `Trigger word "${triggerWord}" detected. Emergency SMS sent.`,
    });
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