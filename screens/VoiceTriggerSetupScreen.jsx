import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEEPGRAM_API_KEY = '439e9d68b1482b32378dd2f10c957276d906430f';

const { width, height } = Dimensions.get('window');

const HelpDetectionScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [triggerWord, setTriggerWord] = useState('help');
  const [hasStarted, setHasStarted] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const stopFlag = useRef(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Load contacts from storage on component mount
  useEffect(() => {
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
  }, []);

  // Save contacts to storage whenever they change
  useEffect(() => {
    const saveContacts = async () => {
      try {
        await AsyncStorage.setItem('@emergency_contacts', JSON.stringify(contacts));
      } catch (e) {
        console.error('Failed to save contacts', e);
      }
    };
    
    if (contacts.length > 0) {
      saveContacts();
    }
  }, [contacts]);

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

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const granted = await requestPermissions();
      if (isMounted) setHasPermission(granted);
    };
    init();
    return () => {
      isMounted = false;
      stopFlag.current = true;
      stopRecording();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const audio = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        const sms = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS
        );
        const location = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return (
          audio === PermissionsAndroid.RESULTS.GRANTED &&
          sms === PermissionsAndroid.RESULTS.GRANTED &&
          location === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (e) {
        console.log('Permission error:', e);
        return false;
      }
    }
    return true;
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
          console.log(contacts)

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

  const startRecordingLoop = async () => {
    setHasStarted(true);
    const filePath = `${RNFS.DocumentDirectoryPath}/help-detect.m4a`;

    while (!stopFlag.current) {
      try {
        const exists = await RNFS.exists(filePath);
        if (exists) await RNFS.unlink(filePath);

        await audioRecorderPlayer.current.startRecorder(filePath);
        setIsRecording(true);

        await new Promise((res) => setTimeout(res, 5000));

        await audioRecorderPlayer.current.stopRecorder();
        setIsRecording(false);

        const audioData = await RNFS.readFile(filePath, 'base64');
        const audioBuffer = Buffer.from(audioData, 'base64');

        const response = await axios.post(
          'https://api.deepgram.com/v1/listen',
          audioBuffer,
          {
            headers: {
              'Content-Type': 'audio/mp3',
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

  const stopRecording = () => {
    try {
      audioRecorderPlayer.current.stopRecorder();
      setHasStarted(false);
      stopFlag.current = true;
    } catch (e) {
      console.error('Stop recording error:', e);
    }
  };

  const addContact = () => {
    if (newContact.trim() && !contacts.includes(newContact)) {
      const updatedContacts = [...contacts, newContact.trim()];
      setContacts(updatedContacts);
      setNewContact('');
    }
  };

  const removeContact = (number) => {
    const updatedContacts = contacts.filter((c) => c !== number);
    setContacts(updatedContacts);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6a11cb" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>VoiceGuard Emergency</Text>
        <Text style={styles.subtitle}>Detect trigger words and alert contacts</Text>
      </View>
      
      {/* Main Content */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Recording Indicator */}
        <View style={styles.recordingSection}>
          <Animated.View style={[
            styles.recordingCircle,
            { transform: [{ scale: pulseAnim }] },
            isRecording && styles.recordingActive
          ]}>
            <View style={styles.innerCircle}>
              <Text style={styles.micIcon}>🎤</Text>
            </View>
          </Animated.View>
          
          <Text style={styles.statusText}>
            {isRecording ? 'Listening for "' + triggerWord + '"...' : 
             hasStarted ? 'Processing audio...' : 'Ready to listen'}
          </Text>
        </View>
        
        {/* Controls */}
        <View style={styles.controls}>
          {!hasStarted && hasPermission && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                stopFlag.current = false;
                startRecordingLoop();
              }}
            >
              <Text style={styles.buttonText}>▶️ Start Listening</Text>
            </TouchableOpacity>
          )}

          {hasStarted && (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Text style={styles.buttonText}>⏹️ Stop Listening</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Settings Card */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingGroup}>
            <Text style={styles.inputLabel}>Trigger Word</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter trigger word"
              placeholderTextColor="#aaa"
              value={triggerWord}
              onChangeText={setTriggerWord}
            />
          </View>
          
          <View style={styles.settingGroup}>
            <Text style={styles.inputLabel}>Add Emergency Contact</Text>
            <View style={styles.contactInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Phone number (+91...)"
                placeholderTextColor="#aaa"
                value={newContact}
                onChangeText={setNewContact}
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.addButton} onPress={addContact}>
                <Text style={styles.addButtonText}>➕ Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.contactsHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity onPress={() => setShowContacts(!showContacts)}>
              <Text style={styles.toggleText}>
                {showContacts ? '▲ Hide' : '▼ Show'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showContacts && (
            <View style={styles.contactsContainer}>
              {contacts.length === 0 ? (
                <Text style={styles.emptyContacts}>No contacts added yet</Text>
              ) : (
                <ScrollView 
                  style={{ maxHeight: 200 }}
                  nestedScrollEnabled={true}
                >
                  {contacts.map((item) => (
                    <View key={item} style={styles.contactItem}>
                      <Text style={styles.contactText}>📱 {item}</Text>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeContact(item)}
                      >
                        <Text style={styles.removeText}>✖</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>
        
        {/* Emergency Info */}
      
      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Your safety is our priority</Text>
      </View>
      
      {!hasPermission && (
        <Text style={styles.permissionWarning}>
          Permissions not granted. Please allow microphone and SMS access.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a11cb',
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 25,
    backgroundColor: '#6a11cb',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    padding: 25,
    paddingTop: 10,
    paddingBottom: 100,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recordingCircle: {
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingActive: {
    backgroundColor: 'rgba(234, 67, 53, 0.2)',
  },
  innerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  micIcon: {
    fontSize: 60,
  },
  statusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#00c853',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  stopButton: {
    backgroundColor: '#ff3d00',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
  },
  settingGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    color: '#2c3e50',
  },
  contactInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  toggleText: {
    color: '#3498db',
    fontWeight: '700',
  },
  contactsContainer: {
    maxHeight: 200,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  contactText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#ffeef0',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContacts: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e91e63',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#fff',
  },
  footerText: {
    color: '#6a11cb',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionWarning: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff6b6b',
    color: '#fff',
    textAlign: 'center',
    padding: 15,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HelpDetectionScreen;
