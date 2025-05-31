import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const CommunityScreen = () => {
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('groups')
      .onSnapshot(snapshot => {
        const groupList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupList);
      });

    return () => unsubscribe();
  }, []);

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Group name cannot be empty!');
      return;
    }

    try {
      await firestore().collection('groups').add({
        name: groupName,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      setGroupName('');
    } catch (error) {
      Alert.alert('Error creating group', error.message);
    }
  };

  const joinGroup = (groupId, groupName) => {
    navigation.navigate('GroupChatScreen', {
      groupId,
      groupName,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Groups</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter group name"
          placeholderTextColor="#999"
          value={groupName}
          onChangeText={setGroupName}
          style={styles.input}
        />
        <Button 
          title="Create Group" 
          onPress={createGroup} 
          color="#5E60CE" 
        />
      </View>

      <Text style={styles.subtitle}>Available Groups</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupItem}
            onPress={() => joinGroup(item.id, item.name)}
          >
            <Text style={styles.groupText}>{item.name}</Text>
            <View style={styles.joinBadge}>
              <Text style={styles.joinText}>Join</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No groups available. Create one!</Text>
        }
      />
    </View>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    color: '#5E60CE',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 12,
    backgroundColor: '#FFF',
    padding: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#333',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 16,
    color: '#4A4A4A',
  },
  listContent: {
    paddingBottom: 24,
  },
  groupItem: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#5E60CE',
    shadowColor: '#5E60CE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  groupText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A4A4A',
    flex: 1,
  },
  joinBadge: {
    backgroundColor: '#5E60CE',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  joinText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});