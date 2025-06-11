import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Phone,
  Shield,
  Hospital,
  HelpCircle,
  Home,
  Trash2,
  ChevronLeft,
  Plus,
  AlertTriangle,
  X
} from 'lucide-react-native';

const STORAGE_KEY = 'EMERGENCY_CONTACTS';

const ICON_MAP = {
  phone: Phone,
  shield: Shield,
  hospital: Hospital,
  help: HelpCircle,
  home: Home
};

const DEFAULT_CONTACTS = [
  { name: "Local Police Station", number: "100", icon: "shield", color: "#3a86ff" },
  { name: "Ambulance Service", number: "108", icon: "hospital", color: "#ff006e" },
  { name: "Women's Helpline", number: "1091", icon: "help", color: "#8338ec" },
  { name: "Domestic Violence Helpline", number: "1-800-799-7233", icon: "home", color: "#fb5607" }
];

export default function EmergencyScreen({ navigation }) {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [shakeAnim] = useState(new Animated.Value(0));

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

  const persistContacts = async (contacts) => {
    setEmergencyContacts(contacts);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleAddContact = async () => {
    if (!newName.trim() || !newNumber.trim()) {
      // Shake animation for validation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();
      
      Alert.alert('Missing Information', 'Please enter both name and number.');
      return;
    }

    const newContact = {
      name: newName,
      number: newNumber,
      icon: "phone",
      color: "#4ecdc4"
    };

    const updated = [...emergencyContacts, newContact];
    await persistContacts(updated);
    setNewName('');
    setNewNumber('');
    setShowAddForm(false);
  };

  const handleDelete = async (index) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    await persistContacts(updated);
    setDeleteIndex(null);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
  };

  const renderEmergencyCard = (contact, index) => {
    const Icon = ICON_MAP[contact.icon] || Phone;
    return (
      <TouchableOpacity
        key={index}
        style={[styles.contactCard, { borderLeftColor: contact.color }]}
        onPress={() => handleCall(contact.number)}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${contact.color}20` }]}>
          <Icon color={contact.color} size={24} />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactNumber}>{contact.number}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            confirmDelete(index);
          }}
        >
          <Trash2 color="#777" size={18} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>Immediate help at your fingertips</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Services</Text>
            <Text style={styles.sectionSubtitle}>Tap to call immediately</Text>
          </View>
          
          <View style={styles.cardContainer}>
            {emergencyContacts.map((contact, index) => renderEmergencyCard(contact, index))}
          </View>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowAddForm(true)}
          >
            <Plus color="#fff" size={20} />
            <Text style={styles.addButtonText}>Add Custom Contact</Text>
          </TouchableOpacity>
          
          <View style={styles.infoBox}>
            <AlertTriangle size={20} color="#FF9800" />
            <Text style={styles.infoText}>
              In an emergency, remain calm and provide clear information about your location and situation.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Contact Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddForm}
        onRequestClose={() => setShowAddForm(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[styles.modalContent, { transform: [{ translateX: shakeAnim }] }]}
          >
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowAddForm(false)}
            >
              <X color="#777" size={24} />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Add New Contact</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Doctor Smith"
                value={newName}
                onChangeText={setNewName}
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +1 (555) 123-4567"
                value={newNumber}
                onChangeText={setNewNumber}
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={handleAddContact}
            >
              <Text style={styles.modalButtonText}>Save Contact</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteIndex !== null}
        onRequestClose={() => setDeleteIndex(null)}
      >
        <View style={styles.confirmModalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Delete Contact?</Text>
            {deleteIndex !== null && (
              <Text style={styles.confirmText}>
                Are you sure you want to delete {emergencyContacts[deleteIndex]?.name}?
              </Text>
            )}
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={() => setDeleteIndex(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.deleteButtonConfirm]} 
                onPress={() => handleDelete(deleteIndex)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#6C63FF',
    paddingVertical: 50,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    marginBottom: 15,
    paddingLeft: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3748',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  cardContainer: {
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderLeftWidth: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 14,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 15,
    color: '#4a5568',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 25,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
    marginLeft: 10,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 14,
    padding: 16,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#805b10',
    marginLeft: 12,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  modalButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  confirmModalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    width: '90%',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 10,
  },
  confirmText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  confirmButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  deleteButtonConfirm: {
    backgroundColor: '#ff5252',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#4a5568',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});