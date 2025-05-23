import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

export default function SafetyPlanScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { text: "Hello, I'm your safety assistant. How can I help you today?", fromUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  const getAIResponse = async (message) => {
    try {
      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 6xr5q0MxmzkQMq8tswl7KCuR5PWj9LpFXYk8eEWm', // Replace with your key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-r-plus',
          temperature: 0.5,
          chat_history: [],
          message,
        }),
      });

      const data = await response.json();
      return data.text || "I'm sorry, I couldn't understand that.";
    } catch (error) {
      console.error('AI fetch error:', error);
      return "There was a problem connecting to the AI. Please try again.";
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, fromUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    const aiReplyText = await getAIResponse(inputText);
    const aiMessage = { text: aiReplyText, fromUser: false };
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.title}>Safety Planning Assistant</Text>

      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.fromUser ? styles.userBubble : styles.aiBubble
            ]}
          >
            <Text style={[styles.messageText, msg.fromUser && styles.userMessageText]}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about safety planning..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={{ color: '#6C63FF', fontWeight: 'bold' }}>SEND</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6C63FF',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 15,
  },
  chatContent: {
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
  },
  backButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
