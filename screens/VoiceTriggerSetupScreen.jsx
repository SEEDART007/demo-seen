import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { Buffer } from 'buffer';

const DEEPGRAM_API_KEY = '439e9d68b1482b32378dd2f10c957276d906430f'; // Replace with yours

const HelpDetectionScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [triggerWord, setTriggerWord] = useState('help');
  const [hasStarted, setHasStarted] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState('');
  const stopFlag = useRef(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());

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
      setContacts([...contacts, newContact.trim()]);
      setNewContact('');
    }
  };

  const removeContact = (number) => {
    setContacts(contacts.filter((c) => c !== number));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Help Detection</Text>
      <Text style={styles.status}>
        {isRecording ? '🎤 Recording...' : hasStarted ? '🧠 Processing...' : '⏸️ Idle'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter trigger word"
        value={triggerWord}
        onChangeText={setTriggerWord}
      />

      <TextInput
        style={styles.input}
        placeholder="Add emergency contact (+91...)"
        value={newContact}
        onChangeText={setNewContact}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.addButton} onPress={addContact}>
        <Text style={styles.addButtonText}>➕ Add Contact</Text>
      </TouchableOpacity>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>{item}</Text>
            <TouchableOpacity onPress={() => removeContact(item)}>
              <Text style={styles.removeText}>✖</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#aaa', marginTop: 10 }}>No emergency contacts added.</Text>
        }
        style={{ width: '100%', marginTop: 10 }}
      />

      {!hasStarted && hasPermission && (
        <TouchableOpacity
          style={styles.listenButton}
          onPress={() => {
            stopFlag.current = false;
            startRecordingLoop();
          }}
        >
          <Text style={styles.listenText}>▶️ Start Listening</Text>
        </TouchableOpacity>
      )}

      {hasStarted && (
        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
          <Text style={styles.listenText}>⏹️ Stop Listening</Text>
        </TouchableOpacity>
      )}

      {!hasPermission && (
        <Text style={{ color: 'red', marginTop: 20 }}>
          Permissions not granted. Please allow microphone and SMS access.
        </Text>
      )}
    </View>
  );
};

export default HelpDetectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  status: {
    color: '#00e6ac',
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#005eff',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    width: '100%',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  listenButton: {
    backgroundColor: '#00c851',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  listenText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1f1f1f',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  contactText: {
    color: '#fff',
    fontSize: 16,
  },
  removeText: {
    color: '#f44',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
