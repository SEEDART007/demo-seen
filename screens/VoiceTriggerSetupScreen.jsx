import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { Buffer } from 'buffer';

const DEEPGRAM_API_KEY = '439e9d68b1482b32378dd2f10c957276d906430f';

const HelpDetectionScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const stopFlag = useRef(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const granted = await requestPermissions();
      if (isMounted) setHasPermission(granted);
      if (granted) startRecordingLoop();
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
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      } catch (e) {
        return false;
      }
    }
    return true;
  };

  const startRecordingLoop = async () => {
    const filePath = `${RNFS.DocumentDirectoryPath}/help-detect.m4a`;

    while (!stopFlag.current) {
      try {
        // Clean up previous file if exists
        const exists = await RNFS.exists(filePath);
        if (exists) await RNFS.unlink(filePath);

        // Start Recording
        await audioRecorderPlayer.current.startRecorder(filePath);
        setIsRecording(true);

        await new Promise(res => setTimeout(res, 5000));

        await audioRecorderPlayer.current.stopRecorder();
        setIsRecording(false);

        // Read and send to Deepgram
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

        if (transcript && transcript.toLowerCase().includes('help')) {
          Alert.alert('🆘 Help Detected!', 'Detected the word "help" in speech.');
          stopFlag.current = true;
          break;
        }
      } catch (err) {
        console.error('Recording loop error:', err);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    try {
      audioRecorderPlayer.current.stopRecorder();
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Listening for "help"... </Text>
      <Text style={styles.status}>{isRecording ? 'Recording...' : 'Waiting...'}</Text>
      {!hasPermission && (
        <Text style={{ color: 'red', marginTop: 20 }}>
          Permissions not granted. Please allow microphone access.
        </Text>
      )}
    </View>
  );
};

export default HelpDetectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
  },
  status: {
    color: '#00ffcc',
    fontSize: 16,
  },
});