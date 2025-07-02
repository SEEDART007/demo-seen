import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
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
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingResponse, setLoadingResponse] = useState(false);

  const loadMoodHistory = async () => {
    const stored = await AsyncStorage.getItem('moodHistory');
    const parsed = stored ? JSON.parse(stored) : [];
    setMoodHistory(parsed);

    const today = new Date().toISOString().split('T')[0];
    const alreadyChecked = parsed.find((entry) => entry.date === today);
    setHasCheckedInToday(!!alreadyChecked);
  };

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const handleMoodCheckIn = async (mood) => {
    if (hasCheckedInToday) {
      Alert.alert("You've already checked in today!");
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newEntry = { date: today, mood: MOOD_VALUES[mood] };
    const updatedHistory = [...moodHistory, newEntry];
    setMoodHistory(updatedHistory);
    await AsyncStorage.setItem('moodHistory', JSON.stringify(updatedHistory));

    setCheckInMood(mood);
    setHasCheckedInToday(true);
  };

  const startBreathingExercise = () => {
    const sequence = ['Inhale deeply', 'Hold...', 'Exhale slowly'];
    let index = 0;

    setBreathingStep(sequence[index]);
    const interval = setInterval(() => {
      index++;
      if (index >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => setBreathingStep(null), 1000);
      } else {
        setBreathingStep(sequence[index]);
      }
    }, 3000);
  };

  const sendMessageToAI = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { from: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setLoadingResponse(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer YOUR_API_KEY_HERE', // Replace your key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            ...chatMessages
              .filter((msg) => msg.from === 'user' || msg.from === 'bot')
              .map((msg) => ({
                role: msg.from === 'user' ? 'user' : 'assistant',
                content: msg.text,
              })),
            {
              role: 'user',
              content: chatInput,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const aiReply = data?.choices?.[0]?.message?.content?.trim() || "I'm here to listen.";
      setChatMessages((prev) => [...prev, { from: 'bot', text: aiReply }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { from: 'bot', text: 'Error fetching AI response.' }]);
    } finally {
      setLoadingResponse(false);
    }
  };

  const renderArticle = ({ item }) => (
    <View style={styles.articleCard}>
      <Text style={styles.articleTitle}>{item.title}</Text>
      <Text style={styles.link}>Read more</Text>
    </View>
  );

  const chartData = {
    labels: moodHistory.map((entry) => entry.date.slice(5)).slice(-7), // last 7 days
    datasets: [
      {
        data: moodHistory.map((entry) => entry.mood).slice(-7),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mental Health Support</Text>

      {/* Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood Tracker (Last 7 Days)</Text>
        {moodHistory.length > 0 ? (
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f3f4f6',
              backgroundGradientTo: '#e5e7eb',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '5', strokeWidth: '2', stroke: '#3b82f6' },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        ) : (
          <Text style={{ color: '#6b7280' }}>No data yet. Start by checking in!</Text>
        )}
      </View>

      {/* Mood Check-In */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling today?</Text>
        <View style={styles.moodButtons}>
          {['😊', '😐', '😢'].map((mood) => (
            <TouchableOpacity key={mood} onPress={() => handleMoodCheckIn(mood)} style={styles.moodButton}>
              <Text style={styles.moodText}>{mood}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {checkInMood && <Text style={styles.feedback}>Checked in: {checkInMood}</Text>}
      </View>

      {/* Breathing Exercise */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Need to calm down?</Text>
        <TouchableOpacity style={styles.breatheButton} onPress={startBreathingExercise}>
          <Text style={styles.breatheText}>Start Breathing Exercise</Text>
        </TouchableOpacity>
        {breathingStep && <Text style={styles.breathingStep}>{breathingStep}</Text>}
      </View>

      {/* AI Chat */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Need to talk?</Text>
        <TouchableOpacity style={styles.talkButton} onPress={() => setShowModal(true)}>
          <Text style={styles.talkText}>Chat Now</Text>
        </TouchableOpacity>
      </View>

      {/* Articles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Helpful Articles</Text>
        <FlatList data={articles} keyExtractor={(item) => item.id} renderItem={renderArticle} scrollEnabled={false} />
      </View>

      {/* Chat Modal */}
      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>AI Support Chat</Text>
          <ScrollView style={styles.chatBox}>
            {chatMessages.map((msg, index) => (
              <View key={index} style={msg.from === 'user' ? styles.userMessage : styles.botMessage}>
                <Text style={styles.chatText}>{msg.text}</Text>
              </View>
            ))}
            {loadingResponse && <ActivityIndicator size="small" color="#555" />}
          </ScrollView>
          <View style={styles.chatInputContainer}>
            <TextInput
              placeholder="Type your message..."
              style={styles.chatInput}
              value={chatInput}
              onChangeText={setChatInput}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessageToAI}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9fafb' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, color: '#111827', textAlign: 'center' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1f2937' },
  moodButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  moodButton: { padding: 10, backgroundColor: '#e0f2fe', borderRadius: 10 },
  moodText: { fontSize: 24 },
  feedback: { textAlign: 'center', marginTop: 10, color: '#3b82f6' },
  breatheButton: { backgroundColor: '#6ee7b7', padding: 12, borderRadius: 10, alignItems: 'center' },
  breatheText: { color: '#065f46', fontWeight: '600' },
  breathingStep: { marginTop: 10, fontSize: 20, textAlign: 'center', color: '#0f766e' },
  talkButton: { backgroundColor: '#fcd34d', padding: 12, borderRadius: 10, alignItems: 'center' },
  talkText: { color: '#78350f', fontWeight: '600' },
  articleCard: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 12, elevation: 1 },
  articleTitle: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
  link: { color: '#3b82f6', fontSize: 14 },
  modalView: { flex: 1, backgroundColor: 'white', padding: 20, paddingTop: 40 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  chatBox: { flex: 1, marginVertical: 10 },
  userMessage: {
    alignSelf: 'flex-end', backgroundColor: '#dbf4ff', padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '80%',
  },
  botMessage: {
    alignSelf: 'flex-start', backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '80%',
  },
  chatText: { fontSize: 16 },
  chatInputContainer: { flexDirection: 'row', marginTop: 10 },
  chatInput: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 12, height: 40,
  },
  sendButton: {
    backgroundColor: '#3b82f6', justifyContent: 'center', paddingHorizontal: 15, borderRadius: 10, marginLeft: 10,
  },
  sendButtonText: { color: 'white', fontWeight: '600' },
  modalCloseButton: { marginTop: 20, alignItems: 'center' },
  modalCloseText: { color: '#3b82f6', fontWeight: '600', fontSize: 16 },
});

export default MentalHealthScreen;
