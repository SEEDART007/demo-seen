import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';

const COHERE_API_KEY = '6xr5q0MxmzkQMq8tswl7KCuR5PWj9LpFXYk8eEWm';

const indianDVLaws = [
  {
    id: 1,
    title: 'Protection of Women from DV Act, 2005',
    description:
      'A comprehensive law that aims to protect women from domestic violence including physical, sexual, emotional, verbal, and economic abuse.',
  },
  {
    id: 2,
    title: 'Section 498A IPC',
    description:
      'Punishes a husband or his relatives for subjecting a woman to cruelty, including physical harm and harassment over dowry.',
  },
  {
    id: 3,
    title: 'Section 304B IPC',
    description:
      'Applies when a woman dies due to burns, injuries, or under suspicious circumstances within 7 years of marriage and dowry harassment is suspected.',
  },
  {
    id: 4,
    title: 'Dowry Prohibition Act, 1961',
    description:
      'Makes giving, taking, or demanding dowry a criminal offense. It seeks to eliminate the social evil of dowry and related violence.',
  },
  {
    id: 5,
    title: 'Section 125 CrPC',
    description:
      'Provides the right to claim maintenance for a wife (including divorced), children, or parents who are unable to maintain themselves.',
  },
  {
    id: 6,
    title: 'Hindu Marriage Act, 1955',
    description:
      'Allows for judicial separation and divorce on grounds including cruelty, desertion, and adultery in Hindu marriages.',
  },
  {
    id: 7,
    title: 'Section 23 DV Act',
    description:
      'Empowers the court to pass interim and ex parte orders for the immediate protection of women from domestic violence.',
  },
  {
    id: 8,
    title: 'Section 18 DV Act',
    description:
      'Provides for protection orders to prevent the respondent from committing any act of domestic violence or aiding in its commission.',
  },
  {
    id: 9,
    title: 'Section 19 DV Act',
    description:
      'Enables women to remain in their shared household and bars the abuser from dispossessing or disturbing them from their residence.',
  },
];


export default function IndianLawsScreen({ navigation }) {
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAIExplanation = async (lawTitle) => {
    try {
      setLoading(true);
      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedLaw?.title}</Text>
            <Text style={styles.modalText}>
              {loading
                ? 'Fetching AI explanation...'
                : aiExplanation ||selectedLaw?.description}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.aiButton}
                onPress={() => fetchAIExplanation(selectedLaw.title)}
              >
                <Text style={styles.buttonText}>Explain with AI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 40, paddingHorizontal: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: { paddingBottom: 100 },
  lawCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  lawTitle: {
    fontSize: 16,
    color: '#333',
    maxWidth: '80%',
  },
  infoButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
