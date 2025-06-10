import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const LiveAgressionDetection = () => {
  const [emotion, setEmotion] = useState('No emotion detected');
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const recordingInterval = useRef(null);
  const currentFilePath = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (isRecording) {
        audioRecorderPlayer.stopRecorder();
      }
    };
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.log('Microphone permission denied');
      return;
    }

    try {
      currentFilePath.current = `${RNFS.CachesDirectoryPath}/recording-${Date.now()}.wav`;
      await audioRecorderPlayer.startRecorder(currentFilePath.current);
      setIsRecording(true);

      recordingInterval.current = setInterval(async () => {
        try {
          await audioRecorderPlayer.stopRecorder();

          const exists = await RNFS.exists(currentFilePath.current);
          if (exists) {
            await sendAudioChunk(currentFilePath.current);
          }

          currentFilePath.current = `${RNFS.CachesDirectoryPath}/recording-${Date.now()}.wav`;
          await audioRecorderPlayer.startRecorder(currentFilePath.current);
        } catch (error) {
          console.error('Error in recording interval:', error);
        }
      }, 5000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }

      await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);

      if (currentFilePath.current) {
        const exists = await RNFS.exists(currentFilePath.current);
        if (exists) {
          await RNFS.unlink(currentFilePath.current);
        }
        currentFilePath.current = null;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const sendAudioChunk = async (filePath) => {
    try {
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        console.warn('File not found:', filePath);
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: `file://${filePath}`,
        type: 'audio/wav',
        name: 'audio_chunk.wav',
      });

      // 🌐 Deployed backend URL
      const SERVER_URL = 'https://agression-detection-model.onrender.com/predict';

      console.log('Uploading to:', SERVER_URL);

      const response = await fetch(SERVER_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      if (result.emotion && isMounted.current) {
        setEmotion(result.emotion);
      }

      const stillExists = await RNFS.exists(filePath);
      if (stillExists) {
        await RNFS.unlink(filePath);
      }
    } catch (error) {
      console.error('Error sending audio chunk:', error);
      try {
        const stillExists = await RNFS.exists(filePath);
        if (stillExists) {
          await RNFS.unlink(filePath);
        }
      } catch (cleanError) {
        console.warn('Failed to clean up file:', cleanError);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emotionText}>Detected Emotion: {emotion}</Text>
      {isRecording ? (
        <Button title="Stop Detection" onPress={stopRecording} />
      ) : (
        <Button title="Start Detection" onPress={startRecording} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emotionText: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
});

export default LiveAgressionDetection;
