import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
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
          'Authorization': 'Bearer 6xr5q0MxmzkQMq8tswl7KCuR5PWj9LpFXYk8eEWm', 
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header with gradient and back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Safety Planning Assistant</Text>
        </View>

        {/* Chat container */}
        <View style={styles.chatBackground}>
          <ScrollView
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
            style={styles.chatScrollView}
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
        </View>

        {/* Input area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about safety planning..."
            placeholderTextColor="#8A8A8F"
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim() ? styles.activeSendButton : null]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6C63FF', // Match header color for notch area
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#6C63FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 24,
  },
  chatBackground: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  chatScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6C63FF',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#3A3A3C',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E6E6EA',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6E6EA',
  },
  activeSendButton: {
    backgroundColor: '#6C63FF',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});