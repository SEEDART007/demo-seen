import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform, TextInput, Button } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { Buffer } from 'buffer';

const DEEPGRAM_API_KEY = '439e9d68b1482b32378dd2f10c957276d906430f';

const HelpDetectionScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [triggerWord, setTriggerWord] = useState('help');
  const [hasStarted, setHasStarted] = useState(false);
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
    setHasStarted(true);
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

        if (
          transcript &&
          triggerWord &&
          transcript.toLowerCase().includes(triggerWord.toLowerCase())
        ) {
          Alert.alert('🆘 Trigger Detected!', `Detected the word "${triggerWord}" in speech.`);
          stopFlag.current = true;
          setHasStarted(false);
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
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Listening for trigger word... </Text>
      <Text style={styles.status}>{isRecording ? 'Recording...' : hasStarted ? 'Processing...' : 'Waiting...'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter trigger word"
        value={triggerWord}
        onChangeText={setTriggerWord}
      />
      {!hasStarted && hasPermission && (
        <Button title="Start Listening" onPress={() => {
          stopFlag.current = false;
          startRecordingLoop();
        }} />
      )}
      {hasStarted && (
        <Button title="Stop Listening" color="#f44" onPress={stopRecording} />
      )}
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
  input: {
    backgroundColor: '#fff',
    color: '#111',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 20,
    width: '80%',
    marginBottom: 30,
  },
});