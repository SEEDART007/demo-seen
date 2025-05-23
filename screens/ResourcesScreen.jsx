import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';

export default function DomesticLawsScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLaw, setSelectedLaw] = useState(null);

  const laws = [
    { title: 'Section 498A IPC', key: '498a' },
    { title: 'Protection of Women from DV Act, 2005', key: 'pwdva' },
    { title: 'Section 304B IPC', key: '304b' },
    { title: 'Dowry Prohibition Act, 1961', key: 'dowry' },
    { title: 'Section 125 CrPC', key: '125crpc' },
    { title: 'Section 323 IPC', key: '323' },
    { title: 'Section 506 IPC', key: '506' },
  ];

  const explanations = {
    '498a': 'Section 498A IPC protects married women from cruelty by husband or relatives, including physical and emotional abuse or demands for dowry.',
    'pwdva': 'The Protection of Women from Domestic Violence Act, 2005 provides protection to women from physical, sexual, verbal, emotional, and economic abuse.',
    '304b': 'Section 304B IPC deals with dowry deaths. If a woman dies under suspicious circumstances within 7 years of marriage due to dowry, it is punishable.',
    'dowry': 'The Dowry Prohibition Act, 1961 makes the giving or taking of dowry a punishable offense in India.',
    '125crpc': 'Section 125 of CrPC provides a legal right to maintenance for wives, children, and parents who are unable to support themselves.',
    '323': 'Section 323 IPC punishes voluntarily causing hurt with imprisonment or fine.',
    '506': 'Section 506 IPC deals with criminal intimidation including threats that cause fear of injury or death.',
  };

  const showExplanation = (key) => {
    setSelectedLaw(explanations[key]);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🇮🇳 Domestic Violence Laws in India</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {laws.map((law, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{law.title}</Text>
            <TouchableOpacity onPress={() => showExplanation(law.key)}>
              <Text style={styles.infoButton}>i</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{selectedLaw}</Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.backButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 40, paddingHorizontal: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6C63FF',
    textAlign: 'center',
  },
  scrollContent: { paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '600',
  },
  infoButton: {
    fontSize: 18,
    color: '#6C63FF',
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  modalClose: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
