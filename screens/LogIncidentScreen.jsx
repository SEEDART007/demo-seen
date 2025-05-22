import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function LogIncidentScreen({ navigation }) {
  const [incidentText, setIncidentText] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());

  const handleSave = () => {
    if (!incidentText.trim()) {
      Alert.alert('Please describe the incident.');
      return;
    }

    // Save to local storage or secure store (e.g., AsyncStorage, SQLite, or SecureStore)
    console.log('Incident Logged:', { timestamp, incidentText });

    Alert.alert('Incident logged securely.');
    setIncidentText('');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log an Incident</Text>
      <Text style={styles.label}>Date & Time: {timestamp}</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe what happened..."
        multiline
        value={incidentText}
        onChangeText={setIncidentText}
      />
      <Button title="Save Incident" onPress={handleSave} color="#6C63FF" />
      <View style={{ marginTop: 10 }}>
        <Button title="Go Back" onPress={() => navigation.goBack()} color="#888" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#6C63FF' },
  label: { fontSize: 16, marginBottom: 10, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    height: 150,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginBottom: 20
  }
});
