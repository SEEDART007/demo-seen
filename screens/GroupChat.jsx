import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const GroupChatScreen = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: groupName });
  }, [navigation, groupName]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
      });

    return () => unsubscribe();
  }, [groupId]);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    const currentUser = auth().currentUser;

    try {
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('messages')
        .add({
          text: message,
          sender: currentUser ? currentUser.email : 'Anonymous',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      setMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.messageBubble}>
      <Text style={styles.sender}>{item.sender}</Text>
      <Text>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default GroupChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageBubble: {
    padding: 10,
    backgroundColor: '#e3e3e3',
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
  },
});
