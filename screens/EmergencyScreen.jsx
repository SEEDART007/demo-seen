import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'EMERGENCY_CONTACTS';

const DEFAULT_CONTACTS = [
  { name: "Local Police Station", number: "100", emoji: "🚓", color: "#3a86ff" },
  { name: "Ambulance Service", number: "108", emoji: "🚑", color: "#ff006e" },
  { name: "Women's Helpline", number: "1091", emoji: "👩‍🦰", color: "#8338ec" },
  { name: "Domestic Violence Helpline", number: "1-800-799-7233", emoji: "🏠", color: "#fb5607" }
];

export default function EmergencyScreen({ navigation }) {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');

  // Load contacts from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setEmergencyContacts(JSON.parse(stored));
        } else {
          setEmergencyContacts(DEFAULT_CONTACTS);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTACTS));
        }
      } catch (e) {
        setEmergencyContacts(DEFAULT_CONTACTS);
      }
    })();
  }, []);

  // Save contacts to storage whenever they change
  const persistContacts = async (contacts) => {
    setEmergencyContacts(contacts);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleAddContact = async () => {
    if (!newName.trim() || !newNumber.trim()) {
      Alert.alert('Missing Information', 'Please enter both name and number.');
      return;
    }
    const newContact = {
      name: newName,
      number: newNumber,
      emoji: "📞",
      color: "#4ecdc4"
    };
    const updated = [...emergencyContacts, newContact];
    await persistContacts(updated);
    setNewName('');
    setNewNumber('');
  };

  const handleDelete = async (index) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    await persistContacts(updated);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.subtitle}>Immediate help at your fingertips</Text>
        </View>

        <View style={styles.cardContainer}>
          {emergencyContacts.map((contact, index) => (
            <View key={index} style={[styles.contactCard, { borderLeftColor: contact.color }]}>
              <TouchableOpacity
                style={[styles.emojiContainer, { backgroundColor: `${contact.color}20` }]}
                onPress={() => handleCall(contact.number)}
              >
                <Text style={styles.emoji}>{contact.emoji}</Text>
              </TouchableOpacity>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(index)}>
                <Text style={styles.deleteButtonText}>✖</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add New Contact Section */}
        <View style={styles.addContactContainer}>
          <Text style={styles.addContactTitle}>Add Emergency Contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={newName}
            onChangeText={setNewName}
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={newNumber}
            onChangeText={setNewNumber}
            keyboardType="phone-pad"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6C63FF',
    padding: 25,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  emojiContainer: {
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  emoji: {
    fontSize: 22,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: '#ff5252',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addContactContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  addContactTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
    color: '#6C63FF',
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 10,
    backgroundColor: '#fafafa'
  },
  addButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});