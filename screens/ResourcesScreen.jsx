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
  Dimensions,
  StatusBar
} from 'react-native';
import Tts from 'react-native-tts';
import { Info, X, Copy, Share2, Volume2, ChevronRight } from 'lucide-react-native';

const COHERE_API_KEY = '6xr5q0MxmzkQMq8tswl7KCuR5PWj9LpFXYk8eEWm';
const { width } = Dimensions.get('window');

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
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardAnimations = useRef(indianDVLaws.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animate cards in sequence
    const animations = cardAnimations.map((anim, index) => {
      return Animated.spring(anim, {
        toValue: 1,
        friction: 6,
        delay: index * 100,
        useNativeDriver: true,
      });
    });
    
    Animated.stagger(100, animations).start();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      Tts.stop();
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

  const handleSpeak = () => {
    const textToSpeak = aiExplanation || selectedLaw?.description;
    if (textToSpeak) {
      Tts.speak(textToSpeak);
    }
  };

  const openModal = (law) => {
    setSelectedLaw(law);
    setAiExplanation('');
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6a11cb" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🇮🇳 Indian Domestic Violence Laws</Text>
        <Text style={styles.subtitle}>Know your legal rights and protections</Text>
      </View>
      
      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {indianDVLaws.map((law, index) => (
          <Animated.View 
            key={law.id} 
            style={[
              styles.lawCard,
              { 
                transform: [{ scale: cardAnimations[index] }],
                opacity: cardAnimations[index]
              }
            ]}
          >
            <View style={styles.lawNumber}>
              <Text style={styles.lawNumberText}>{law.id}</Text>
            </View>
            <View style={styles.lawContent}>
              <Text style={styles.lawTitle}>{law.title}</Text>
              <Text style={styles.lawDescription} numberOfLines={2}>{law.description}</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoButton} 
              onPress={() => openModal(law)}
            >
              <ChevronRight size={24} color="#4f46e5" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedLaw?.title}</Text>
              <TouchableOpacity 
                style={styles.closeIcon} 
                onPress={() => setModalVisible(false)}
              >
                <X size={28} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.textScroll} contentContainerStyle={{ paddingBottom: 20 }}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>⚡ Generating AI explanation...</Text>
                </View>
              ) : (
                <Text style={styles.modalText}>
                  {aiExplanation || selectedLaw?.description}
                </Text>
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.aiButton]} 
                onPress={() => fetchAIExplanation(selectedLaw.title)}
              >
                <Text style={styles.actionButtonText}>🤖 Explain with AI</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.utilButtons}>
              <TouchableOpacity style={styles.utilButton} onPress={handleCopy}>
                <Copy size={20} color="#4f46e5" />
                <Text style={styles.utilButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilButton} onPress={handleShare}>
                <Share2 size={20} color="#4f46e5" />
                <Text style={styles.utilButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilButton} onPress={handleSpeak}>
                <Volume2 size={20} color="#4f46e5" />
                <Text style={styles.utilButtonText}>Speak</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6a11cb',
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollContent: { 
    padding: 20,
    paddingBottom: 100
  },
  lawCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  lawNumber: {
    backgroundColor: '#f1f5f9',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lawNumberText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '700',
  },
  lawContent: {
    flex: 1,
  },
  lawTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  lawDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  infoButton: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#4f46e5',
    flex: 1,
    paddingRight: 10,
  },
  closeIcon: {
    padding: 5,
  },
  textScroll: { 
    maxHeight: 300,
    marginVertical: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
  },
  modalText: { 
    fontSize: 15, 
    color: '#334155', 
    lineHeight: 24, 
    textAlign: 'justify' 
  },
  modalButtons: {
    marginTop: 15,
  },
  actionButton: {
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  aiButton: {
    backgroundColor: '#4f46e5',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  utilButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  utilButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  utilButtonText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '600',
  },
});