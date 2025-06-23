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
  Keyboard,
  Modal,
  Pressable,
  ScrollView
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { 
  Plus, 
  ArrowRight, 
  Trash2, 
  Users, 
  MessageSquare, 
  Lock, 
  X,
  ShieldCheck,
  AlertTriangle,
  LogOut
} from 'lucide-react-native';

const CommunityScreen = () => {
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [userGroupsCount, setUserGroupsCount] = useState(0);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [userMemberships, setUserMemberships] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Get current user
    const user = auth().currentUser;
    setCurrentUser(user);
    
    // Load groups
    const unsubscribeGroups = firestore()
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

    // Load user's group memberships
    const loadUserMemberships = async () => {
      if (user) {
        try {
          const memberships = await firestore()
            .collection('group_memberships')
            .where('userId', '==', user.uid)
            .get();
          
          setUserGroupsCount(memberships.size);
          
          // Store membership group IDs for quick lookup
          const membershipIds = memberships.docs.map(doc => doc.data().groupId);
          setUserMemberships(membershipIds);
        } catch (error) {
          console.error('Error loading user groups:', error);
        }
      }
    };

    loadUserMemberships();

    return () => {
      unsubscribeGroups();
    };
  }, []);

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Invalid Name', 'Group name cannot be empty');
      return;
    }

    Keyboard.dismiss();
    setIsCreating(true);
    
    try {
      const newGroupRef = await firestore().collection('groups').add({
        name: groupName.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        memberCount: 1,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || "Anonymous"
      });

      // Add creator as member
      await firestore().collection('group_memberships').add({
        userId: currentUser.uid,
        groupId: newGroupRef.id,
        joinedAt: firestore.FieldValue.serverTimestamp()
      });

      // Update user's group count and memberships
      setUserGroupsCount(prev => prev + 1);
      setUserMemberships(prev => [...prev, newGroupRef.id]);
      
      setGroupName('');
    } catch (error) {
      Alert.alert('Creation Failed', error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const joinGroup = async (groupId, groupName) => {
    if (userGroupsCount >= 3) {
      Alert.alert(
        'Group Limit Reached', 
        'You can only join up to 3 groups. Please leave one before joining another.'
      );
      return;
    }

    setJoining(true);
    
    try {
      // Check if user is already a member
      const existingMembership = await firestore()
        .collection('group_memberships')
        .where('userId', '==', currentUser.uid)
        .where('groupId', '==', groupId)
        .get();
      
      if (existingMembership.empty) {
        // Add membership
        await firestore().collection('group_memberships').add({
          userId: currentUser.uid,
          groupId: groupId,
          joinedAt: firestore.FieldValue.serverTimestamp()
        });
        
        // Update group member count
        await firestore().collection('groups').doc(groupId).update({
          memberCount: firestore.FieldValue.increment(1)
        });
        
        // Update user's group count and memberships
        setUserGroupsCount(prev => prev + 1);
        setUserMemberships(prev => [...prev, groupId]);
      }
      
      navigation.navigate('GroupChatScreen', { groupId, groupName });
    } catch (error) {
      Alert.alert('Join Failed', error.message);
    } finally {
      setJoining(false);
    }
  };

  const confirmLeaveGroup = (group) => {
    setSelectedGroup(group);
    setLeaveModalVisible(true);
  };

  const leaveGroup = async () => {
    if (!selectedGroup) return;
    
    setLeaving(true);
    
    try {
      // Find the user's membership for this group
      const membership = await firestore()
        .collection('group_memberships')
        .where('userId', '==', currentUser.uid)
        .where('groupId', '==', selectedGroup.id)
        .get();
      
      if (!membership.empty) {
        // Delete the membership
        await membership.docs[0].ref.delete();
        
        // Update group member count
        await firestore().collection('groups').doc(selectedGroup.id).update({
          memberCount: firestore.FieldValue.increment(-1)
        });
        
        // Update user's group count and memberships
        setUserGroupsCount(prev => prev - 1);
        setUserMemberships(prev => prev.filter(id => id !== selectedGroup.id));
        
        Alert.alert('Success', `You've left the group "${selectedGroup.name}"`);
      }
    } catch (error) {
      Alert.alert('Leave Failed', error.message);
    } finally {
      setLeaveModalVisible(false);
      setLeaving(false);
    }
  };

  const confirmDeleteGroup = (group) => {
    setSelectedGroup(group);
    setDeleteModalVisible(true);
  };

  const deleteGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      // Delete the group
      await firestore().collection('groups').doc(selectedGroup.id).delete();
      
      // Delete all memberships for this group
      const memberships = await firestore()
        .collection('group_memberships')
        .where('groupId', '==', selectedGroup.id)
        .get();
      
      const batch = firestore().batch();
      memberships.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      // If user was a member, update count
      if (userMemberships.includes(selectedGroup.id)) {
        setUserGroupsCount(prev => prev - 1);
        setUserMemberships(prev => prev.filter(id => id !== selectedGroup.id));
      }
      
      setDeleteModalVisible(false);
      Alert.alert('Success', 'Group deleted successfully');
    } catch (error) {
      Alert.alert('Deletion Failed', error.message);
    }
  };

  const renderGroupItem = ({ item }) => (
    <View style={styles.groupItem}>
      <View style={styles.groupIcon}>
        <Users size={24} color="#6C63FF" />
      </View>
      
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
          
          {/* Action buttons */}
          <View style={styles.actionButtons}>
            {item.createdBy === currentUser?.uid && (
              <TouchableOpacity 
                onPress={() => confirmDeleteGroup(item)}
                style={styles.actionButton}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
            
            {userMemberships.includes(item.id) && item.createdBy !== currentUser?.uid && (
              <TouchableOpacity 
                onPress={() => confirmLeaveGroup(item)}
                style={styles.actionButton}
              >
                <LogOut size={20} color="#f59e0b" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.groupMeta}>
          <Text style={styles.memberCount}>
            {item.memberCount || 1} {item.memberCount === 1 ? 'member' : 'members'}
          </Text>
          <View style={styles.creatorContainer}>
            {item.createdBy === currentUser?.uid && (
              <ShieldCheck size={16} color="#10b981" style={styles.creatorIcon} />
            )}
            <Text style={styles.creatorText}>
              {item.createdBy === currentUser?.uid ? 'You' : item.createdByName}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.joinButton,
          userMemberships.includes(item.id) && styles.joinedButton
        ]}
        onPress={() => joinGroup(item.id, item.name)}
        disabled={joining || userGroupsCount >= 3 || userMemberships.includes(item.id)}
      >
        {joining ? (
          <ActivityIndicator size="small" color="#6C63FF" />
        ) : userMemberships.includes(item.id) ? (
          <Text style={styles.joinedText}>Joined</Text>
        ) : (
          <ArrowRight size={24} color="#6C63FF" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Hub</Text>
        <Text style={styles.subtitle}>Connect with others for support and safety</Text>
        
        <View style={styles.groupCounter}>
          <Users size={18} color="#6C63FF" />
          <Text style={styles.counterText}>
            You've joined {userGroupsCount} of 3 groups
          </Text>
          {userGroupsCount >= 3 && (
            <AlertTriangle size={18} color="#ef4444" style={styles.warningIcon} />
          )}
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create New Support Group</Text>
        <Text style={styles.sectionDescription}>
          Create a private group to connect with trusted individuals
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter group name"
            placeholderTextColor="#94A3B8"
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
                <Plus size={20} color="white" />
                <Text style={styles.buttonText}>Create</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.securityNote}>
          <Lock size={16} color="#94A3B8" />
          <Text style={styles.securityText}>
            Only group creators can delete groups. All conversations are encrypted.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Support Groups</Text>
          <Text style={styles.groupLimitText}>
            Max: 3 groups per user
          </Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
        ) : groups.length > 0 ? (
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id}
              renderItem={renderGroupItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <MessageSquare size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>No groups available</Text>
            <Text style={styles.emptySubtext}>Create the first support group</Text>
          </View>
        )}
        
        {userGroupsCount >= 3 && (
          <View style={styles.limitWarning}>
            <AlertTriangle size={20} color="#ef4444" />
            <Text style={styles.warningText}>
              You've reached the maximum of 3 groups. Leave one to join another.
            </Text>
          </View>
        )}
      </View>
      
      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Pressable
              style={styles.modalClose}
              onPress={() => setDeleteModalVisible(false)}
            >
              <X size={24} color="#94A3B8" />
            </Pressable>
            
            <Trash2 size={48} color="#ef4444" style={styles.deleteIcon} />
            <Text style={styles.modalTitle}>Delete Group</Text>
            <Text style={styles.modalText}>
              Are you sure you want to permanently delete the group "{selectedGroup?.name}"?
            </Text>
            <Text style={styles.modalWarning}>
              This action cannot be undone. All group data will be lost.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButtonModal]}
                onPress={deleteGroup}
              >
                <Text style={[styles.buttonText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Leave Group Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={leaveModalVisible}
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Pressable
              style={styles.modalClose}
              onPress={() => setLeaveModalVisible(false)}
            >
              <X size={24} color="#94A3B8" />
            </Pressable>
            
            <LogOut size={48} color="#f59e0b" style={styles.leaveIcon} />
            <Text style={styles.modalTitle}>Leave Group</Text>
            <Text style={styles.modalText}>
              Are you sure you want to leave the group "{selectedGroup?.name}"?
            </Text>
            <Text style={styles.modalWarning}>
              You'll no longer have access to this group's conversations.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLeaveModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.leaveButtonModal]}
                onPress={leaveGroup}
                disabled={leaving}
              >
                {leaving ? (
                  <ActivityIndicator color="#f59e0b" />
                ) : (
                  <Text style={[styles.buttonText, styles.leaveText]}>Leave</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#F8F9FF',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 12,
  },
  groupCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 12,
  },
  counterText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    fontWeight: '600',
  },
  warningIcon: {
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  groupLimitText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 20,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
    color: '#2D3748',
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    height: 56,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  scrollContainer: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  groupItem: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: '#718096',
    marginRight: 16,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  creatorIcon: {
    marginRight: 4,
  },
  creatorText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  joinButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: '#E0E7FF',
  },
  joinedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    color: '#4A5568',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 8,
  },
  loader: {
    paddingVertical: 30,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  securityText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 12,
    flex: 1,
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  modalClose: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  deleteIcon: {
    marginBottom: 16,
  },
  leaveIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalWarning: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  deleteButtonModal: {
    backgroundColor: '#FEF2F2',
    marginLeft: 12,
  },
  leaveButtonModal: {
    backgroundColor: '#FFFBEB',
    marginLeft: 12,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  cancelText: {
    color: '#475569',
  },
  deleteText: {
    color: '#ef4444',
  },
  leaveText: {
    color: '#f59e0b',
  },
});

export default CommunityScreen;