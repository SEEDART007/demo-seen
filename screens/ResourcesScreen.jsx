import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
  Clipboard,
  Animated,
} from 'react-native';

const COHERE_API_KEY = '6xr5q0MxmzkQMq8tswl7KCuR5PWj9LpFXYk8eEWm';

const indianDVLaws = [
  { id: 1, title: 'Protection of Women from DV Act, 2005', description: 'Protects women from all forms of domestic violence.' },
  { id: 2, title: 'Section 498A IPC', description: 'Punishes cruelty by husband or relatives towards a woman.' },
  { id: 3, title: 'Section 304B IPC', description: 'Deals with dowry deaths within 7 years of marriage.' },
  { id: 4, title: 'Dowry Prohibition Act, 1961', description: 'Prohibits the giving or receiving of dowry.' },
  { id: 5, title: 'Section 125 CrPC', description: 'Allows maintenance claims for wives, children, and parents.' },
  { id: 6, title: 'Hindu Marriage Act, 1955', description: 'Provides legal rights for marriage and divorce among Hindus.' },
  { id: 7, title: 'Section 23 DV Act', description: 'Allows courts to issue immediate protection orders.' },
  { id: 8, title: 'Section 18 DV Act', description: 'Empowers women with protection orders from abuse.' },
  { id: 9, title: 'Section 19 DV Act', description: 'Allows women to stay in the shared household safely.' },
];

export default function IndianLawsScreen() {
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [modalVisible]);

  const fetchAIExplanation = async (lawTitle) => {
    try {
      setLoading(true);
      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-r-plus',
          message: `Explain this Indian domestic violence law in simple terms: ${lawTitle}`,
        }),
      });

      const data = await response.json();
      if (data?.text) {
        setAiExplanation(data.text);
      } else {
        setAiExplanation('No explanation found.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch explanation from AI.');
      setAiExplanation('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(aiExplanation || selectedLaw.description);
    Alert.alert('Copied', 'Text copied to clipboard.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: aiExplanation || selectedLaw.description,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the content.');
    }
  };

  const handleSave = () => {
    Alert.alert('Save', 'Save functionality can be integrated with local storage or file system.');
  };

  const openModal = (law) => {
    setSelectedLaw(law);
    setAiExplanation('');
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🇮🇳 Domestic Violence Laws in India</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {indianDVLaws.map((law) => (
          <View key={law.id} style={styles.lawCard}>
            <Text style={styles.lawTitle}>{law.title}</Text>
            <TouchableOpacity style={styles.infoButton} onPress={() => openModal(law)}>
              <Text style={styles.infoButtonText}>i</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            <Text style={styles.modalTitle}>{selectedLaw?.title}</Text>
            <ScrollView style={styles.textScroll} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalText}>
                {loading ? 'Fetching AI explanation...' : aiExplanation || selectedLaw?.description}
              </Text>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.aiButton} onPress={() => fetchAIExplanation(selectedLaw.title)}>
                <Text style={styles.buttonText}>Explain with AI</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.utilButtons}>
              <TouchableOpacity style={styles.utilButton} onPress={handleCopy}>
                <Text style={styles.utilButtonText}>📋 Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilButton} onPress={handleShare}>
                <Text style={styles.utilButtonText}>🔗 Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilButton} onPress={handleSave}>
                <Text style={styles.utilButtonText}>💾 Save</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7', paddingTop: 50, paddingHorizontal: 20 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3A3A3C',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  scrollContent: { paddingBottom: 120 },
  lawCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  lawTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 12,
  },
  infoButton: {
    backgroundColor: '#6366F1',
    borderRadius: 100,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  textScroll: { maxHeight: 300 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#4B49AC', textAlign: 'center', marginBottom: 12 },
  modalText: { fontSize: 15.5, color: '#3A3A3C', lineHeight: 24, textAlign: 'justify' },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  aiButton: {
    backgroundColor: '#4B49AC',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    flex: 1,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  utilButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
  },
  utilButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  utilButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
});
