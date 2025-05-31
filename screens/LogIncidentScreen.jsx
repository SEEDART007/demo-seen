import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Save, Calendar, Clock, BookOpen } from 'lucide-react-native';

export default function LogIncidentScreen({ navigation }) {
  const [incidentText, setIncidentText] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [date] = useState(new Date().toLocaleDateString());
  const [time] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        if (name) setUserName(name);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!incidentText.trim()) {
      Alert.alert('Validation Error', 'Please describe the incident.');
      return;
    }

    setIsLoading(true);
    
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Save to Firestore
      await firestore().collection('incidents').add({
        userId: user.uid,
        name: userName || 'Anonymous',
        date,
        time,
        log: incidentText,
        createdAt: firestore.FieldValue.serverTimestamp(),
        phone: user.phoneNumber || 'Not provided',
      });

      Alert.alert('Success', 'Incident logged securely.');
      setIncidentText('');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save incident:', error);
      Alert.alert('Error', 'Failed to save incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          disabled={isLoading}
        >
          <ChevronLeft size={28} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Log an Incident</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Calendar size={20} color="#6C63FF" />
            <Text style={styles.infoText}>{date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={20} color="#6C63FF" />
            <Text style={styles.infoText}>{time}</Text>
          </View>
          
          {userName ? (
            <View style={styles.infoRow}>
              <BookOpen size={20} color="#6C63FF" />
              <Text style={styles.infoText}>Logged by: {userName}</Text>
            </View>
          ) : null}
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Describe what happened in detail..."
          placeholderTextColor="#94a3b8"
          multiline
          value={incidentText}
          onChangeText={setIncidentText}
          textAlignVertical="top"
          editable={!isLoading}
        />
        
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Save size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Save Incident Securely</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6C63FF',
  },
  infoContainer: {
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4f46e5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 200,
    backgroundColor: '#fff',
    marginBottom: 20,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    opacity: 1,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});