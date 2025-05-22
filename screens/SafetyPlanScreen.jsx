import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';


// Mock AI responses - in a real app, you'd connect to an actual AI service API
const getAIResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('safe') || lowerMessage.includes('safety')) {
    return "A safety plan should include safe places to go, important documents to take, emergency contacts, and code words to alert others. Would you like me to help you create one step-by-step?";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('emergency')) {
    return "If you're in immediate danger, please call 911 or your local emergency number. For support, you can contact the National Domestic Violence Hotline at 1-800-799-7233. You're not alone.";
  }
  
  if (lowerMessage.includes('leave') || lowerMessage.includes('escape')) {
    return "Leaving can be the most dangerous time. Consider:\n1. Having a packed bag hidden\n2. Copies of important documents\n3. A safe place to go\n4. A code word with trusted contacts\nWould you like more specific guidance?";
  }
  
  return "I'm here to help with safety planning and domestic violence support. You can ask me about:\n- Creating a safety plan\n- Emergency contacts\n- Local resources\n- How to prepare to leave safely\nWhat would you like to know?";
};

export default function SafetyPlanScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { text: "Hello, I'm your safety assistant. How can I help you today?", fromUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = { text: inputText, fromUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse = { text: getAIResponse(inputText), fromUser: false };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
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
            <Text style={styles.messageText}>{msg.text}</Text>
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
          {/* <MaterialIcons name="send" size={24} color="#6C63FF" /> */}
          <Text>SEND</Text>
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