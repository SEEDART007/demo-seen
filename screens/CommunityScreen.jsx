import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const CommunityScreen = () => {
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('groups')
      .orderBy('createdAt', 'desc')
      .onSnapshot({
        next: (snapshot) => {
          const groupList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setGroups(groupList);
          setLoading(false);
        },
        error: (error) => {
          Alert.alert('Connection Error', 'Failed to load groups');
          setLoading(false);
          console.error(error);
        }
      });

    return () => unsubscribe();
  }, []);

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Invalid Name', 'Group name cannot be empty');
      return;
    }

    Keyboard.dismiss();
    setIsCreating(true);
    
    try {
      await firestore().collection('groups').add({
        name: groupName.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        memberCount: 1
      });
      setGroupName('');
    } catch (error) {
      Alert.alert('Creation Failed', error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const joinGroup = (groupId, groupName) => {
    navigation.navigate('GroupChatScreen', { groupId, groupName });
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => joinGroup(item.id, item.name)}
    >
      <View style={styles.groupInfo}>
        <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.memberCount}>
          {item.memberCount || 1} {item.memberCount === 1 ? 'member' : 'members'}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color="#6C63FF" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient 
      colors={['#F8F9FF', '#E6F0FF']} 
      style={styles.container}
    >
      <Text style={styles.title}>Community Hub</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create New Group</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter group name"
            placeholderTextColor="#999"
            value={groupName}
            onChangeText={setGroupName}
            style={styles.input}
            maxLength={30}
          />
          <TouchableOpacity 
            style={styles.createButton}
            onPress={createGroup}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Icon name="add" size={20} color="white" />
                <Text style={styles.buttonText}>Create</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Active Groups</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
        ) : groups.length > 0 ? (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={renderGroupItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="group" size={60} color="#D0D5DD" />
            <Text style={styles.emptyText}>No groups available</Text>
            <Text style={styles.emptySubtext}>Create the first group in your community</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2D3748',
    fontFamily: 'Inter-Bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#4A5568',
    fontFamily: 'Inter-SemiBold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
    color: '#2D3748',
    fontFamily: 'Inter-Regular',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  listContent: {
    paddingBottom: 10,
  },
  groupItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupInfo: {
    flex: 1,
    marginRight: 10,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  memberCount: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Inter-Regular',
  },
  separator: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#4A5568',
    fontFamily: 'Inter-SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  loader: {
    paddingVertical: 30,
  },
});

export default CommunityScreen;