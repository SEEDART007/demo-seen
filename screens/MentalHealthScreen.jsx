import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Modal, TextInput, ScrollView, ActivityIndicator,
  Dimensions, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const articles = [
  { id: '1', title: 'Coping with Trauma: First Steps', link: '#' },
  { id: '2', title: 'Breathing Techniques for Stress Relief', link: '#' },
  { id: '3', title: 'Understanding PTSD After Abuse', link: '#' },
];

const MOOD_VALUES = { '😊': 3, '😐': 2, '😢': 1 };

const MentalHealthScreen = () => {
  const [checkInMood, setCheckInMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [breathingStep, setBreathingStep] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: "Hi! I'm your mental health assistant. How can I support you today?" }
  ]);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    const loadMoodHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('moodHistory');
        const parsed = stored ? JSON.parse(stored) : [];
        setMoodHistory(parsed);
        const today = new Date().toISOString().split('T')[0];
        setHasCheckedInToday(parsed.some(e => e.date === today));
      } catch (e) { console.error(e); }
    };
    loadMoodHistory();
  }, []);

  const handleMoodCheckIn = async (mood) => {
    if (hasCheckedInToday) return Alert.alert("You've already checked in today!");
    const today = new Date().toISOString().split('T')[0];
    const entry = { date: today, mood: MOOD_VALUES[mood] };
    const updated = [...moodHistory, entry];
    setMoodHistory(updated);
    await AsyncStorage.setItem('moodHistory', JSON.stringify(updated));
    setCheckInMood(mood);
    setHasCheckedInToday(true);
    Alert.alert('Thank you!', 'Your mood has been recorded.');
  };

  const startBreathingExercise = () => {
    const steps = ['Breathe IN... 🌬', 'Hold... ✋', 'Breathe OUT... 🍃'];
    let idx = 0;
    setBreathingStep(steps[idx]);
    const timer = setInterval(() => {
      idx++;
      if (idx >= steps.length) {
        clearInterval(timer);
        setTimeout(() => setBreathingStep('Exercise completed! 🎉'), 1000);
      } else {
        setBreathingStep(steps[idx]);
      }
    }, 3000);
  };

  const isCrisis = (text) => /die|suicid|kill myself|worthless|hopeless|self-harm|cutting|I want to disappear/i.test(text);

  // Format messages for Llama 3 model
  const formatMessages = (messages) => {
    return messages.map(m => {
      if (m.from === 'bot') {
        return `<|start_header_id|>assistant<|end_header_id|>\n\n${m.text}<|eot_id|>`
      }
      return `<|start_header_id|>user<|end_header_id|>\n\n${m.text}<|eot_id|>`
    }).join('');
  };

  const sendMessageToAI = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { from: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    if (isCrisis(chatInput)) {
      setChatMessages(prev => [...prev, {
        from: 'bot',
        text: 'Your feelings matter. You\'re not alone. Please reach out to a mental health professional or emergency helpline. Would you like me to list some numbers?'
      }]);
      return;
    }

    setLoadingResponse(true);
    setChatMessages(prev => [...prev, { from: 'bot', text: 'Typing...' }]);

    try {
      // Prepare the prompt with system message and conversation history
      const systemPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a professional mental health assistant. You listen empathetically, give supportive and well-informed responses based on psychological science and emotional care. You avoid medical diagnoses and always suggest consulting a therapist or psychiatrist if the issue is severe. Your tone is gentle, calming, and hopeful.<|eot_id|>`;
      
      const conversationHistory = formatMessages(chatMessages);
      const currentMessage = `<|start_header_id|>user<|end_header_id|>\n\n${chatInput}<|eot_id|>`;
      
      const fullPrompt = systemPrompt + conversationHistory + currentMessage + 
                         '<|start_header_id|>assistant<|end_header_id|>\n\n';

      // Make API call to Hugging Face Inference Endpoint
      const response = await fetch(
        'https://huggingface.co/microsoft/DialoGPT-medium',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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',
          },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
              max_new_tokens: 512,
              temperature: 0.6,
              top_p: 0.9,
              return_full_text: false
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const reply = data[0]?.generated_text || "I'm here for you.";

      // Clean up any remaining special tokens
      const cleanReply = reply
        .replace(/<\|[^>]+\|>/g, '')
        .replace(/\[INST\].*?\[\/INST\]/g, '')
        .trim();

      const enhancedReply = cleanReply + "\n\n💡 Tip: You can also ask me about calming techniques, better sleep, or building confidence.";
      
      setChatMessages(prev => [...prev.filter(m => m.text !== 'Typing...'), { from: 'bot', text: enhancedReply }]);
    } catch (e) {
      console.error('API Error:', e);
      setChatMessages(prev => [...prev.filter(m => m.text !== 'Typing...'), { 
        from: 'bot', 
        text: "Sorry, I'm having trouble connecting. Please check your internet or try again later." 
      }]);
    } finally {
      setLoadingResponse(false);
    }
  };

  const chartData = {
    labels: moodHistory.slice(-7).map(e => e.date.slice(5)),
    datasets: [{ data: moodHistory.slice(-7).map(e => e.mood) }],
  };

  const renderArticle = ({ item }) => (
    <TouchableOpacity style={styles.articleCard}>
      <Text style={styles.articleTitle}>{item.title}</Text>
      <Text style={styles.link}>Read more</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mental Health Companion</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Mood This Week</Text>
        {moodHistory.length > 0 ? (
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f8f9fa',
              backgroundGradientTo: '#e9ecef',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(103, 114, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: 5, strokeWidth: 2, stroke: '#6772e5' },
            }}
            bezier
            style={{ borderRadius: 12, marginTop: 10 }}
          />
        ) : (
          <Text style={{ color: '#a0aec0', textAlign: 'center', paddingVertical: 20 }}>
            Check in daily to see your mood chart
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Mood Check</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
          {Object.keys(MOOD_VALUES).map(mood => (
            <TouchableOpacity
              key={mood}
              style={[styles.moodButton, checkInMood === mood && styles.selectedMood]}
              onPress={() => handleMoodCheckIn(mood)}
            >
              <Text style={{ fontSize: 28 }}>{mood}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Calm Exercise</Text>
        <TouchableOpacity style={styles.breatheButton} onPress={startBreathingExercise}>
          <Text style={styles.buttonText}>{breathingStep || 'Start Breathing Exercise'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Need Someone to Talk To?</Text>
        <TouchableOpacity style={styles.chatButton} onPress={() => setShowModal(true)}>
          <Text style={styles.buttonText}>Talk to Mental Health Bot</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Helpful Resources</Text>
        <FlatList 
          data={articles} 
          renderItem={renderArticle} 
          scrollEnabled={false}
          keyExtractor={item => item.id}
        />
      </View>

      <Modal visible={showModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#f7fafc' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mental Health Support Chat</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef} 
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()} 
            style={styles.chatContainer}
          >
            {chatMessages.map((msg, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.messageBubble, 
                  msg.from === 'user' ? styles.userBubble : styles.botBubble
                ]}
              >
                <Text style={msg.from === 'user' ? styles.userText : styles.botText}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {loadingResponse && <ActivityIndicator size="small" color="#666" style={{ margin: 10 }} />}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Type your message..."
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={sendMessageToAI}
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={sendMessageToAI} 
              disabled={loadingResponse}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, backgroundColor: '#f5f7fa' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4a5568', textAlign: 'center', marginBottom: 25 },
  section: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2d3748', marginBottom: 15 },
  moodButton: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#ebf4ff', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  selectedMood: { backgroundColor: '#c3dafe', transform: [{ scale: 1.1 }] },
  breatheButton: { backgroundColor: '#c6f6d5', padding: 15, borderRadius: 8, alignItems: 'center' },
  chatButton: { backgroundColor: '#fed7d7', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#2d3748', fontWeight: '600' },
  articleCard: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  articleTitle: { fontWeight: '600', fontSize: 16, color: '#4a5568' },
  link: { color: '#667eea', marginTop: 5 },
  
  // Modal styles
  modalHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0', 
    backgroundColor: 'white'
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#2d3748' 
  },
  closeButton: { 
    fontSize: 22, 
    color: '#718096' 
  },
  chatContainer: { 
    flex: 1, 
    padding: 15 
  },
  messageBubble: {
    maxWidth: '80%', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 10
  },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#667eea', 
    marginLeft: '20%' 
  },
  botBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#edf2f7', 
    marginRight: '20%' 
  },
  userText: { 
    fontSize: 16, 
    color: 'white' 
  },
  botText: { 
    fontSize: 16, 
    color: 'black' 
  },
  inputContainer: {
    flexDirection: 'row', 
    padding: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#e2e8f0', 
    backgroundColor: 'white'
  },
  inputField: {
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 25, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    marginRight: 10, 
    backgroundColor: '#f8fafc'
  },
  sendButton: {
    backgroundColor: '#667eea', 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    justifyContent: 'center'
  },
  sendButtonText: {
    color: 'white', 
    fontWeight: '600'
  }
});

export default MentalHealthScreen;