import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Save, Calendar, Clock, BookOpen, User, AlertCircle } from 'lucide-react-native';

export default function LogIncidentScreen({ navigation }) {
  const [incidentText, setIncidentText] = useState('');
  const [userName, setUserName] = useState('');
  const [saving, setSaving] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    AsyncStorage.getItem('userName')
      .then((name) => name && setUserName(name))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setLoadingIncidents(false);
      return;
    }
    const unsubscribe = firestore()
      .collection('incidents')
      .onSnapshot(
        (snapshot) => {
          const docs = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              const createdAtMillis = data.createdAt?.toMillis
                ? data.createdAt.toMillis()
                : 0;
              return { id: doc.id, ...data, createdAtMillis };
            })
            .filter((d) => d.userId === user.uid)
            .sort((a, b) => b.createdAtMillis - a.createdAtMillis);
          setIncidents(docs);
          setLoadingIncidents(false);
        },
        () => setLoadingIncidents(false)
      );
    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSave = async () => {
    if (!incidentText.trim()) {
      Alert.alert('Validation Error', 'Please describe the incident.');
      return;
    }
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be signed in to log an incident.');
      return;
    }
    setSaving(true);
    try {
      await firestore().collection('incidents').add({
        userId: user.uid,
        name: userName || 'Anonymous',
        date,
        time,
        log: incidentText.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        phoneNumber: user.phoneNumber || 'Not provided',
      });
      setIncidentText('');
      Keyboard.dismiss();
    } catch {
      Alert.alert('Error', 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const renderIncident = ({ item, index }) => (
    <View style={[
      styles.incidentItem, 
      index === 0 && styles.firstIncident,
      index === incidents.length - 1 && styles.lastIncident
    ]}>
      <View style={styles.incidentHeader}>
        <View style={styles.incidentIcon}>
          <AlertCircle size={20} color="#fff" />
        </View>
        <View style={styles.incidentMeta}>
          <Text style={styles.incidentTitle}>Incident #{incidents.length - index}</Text>
          <View style={styles.metaRow}>
            <Calendar size={14} color="#718096" />
            <Text style={styles.metaText}>{item.date}</Text>
            <Clock size={14} color="#718096" style={styles.timeIcon} />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.incidentText}>{item.log}</Text>
      
      <View style={styles.userContainer}>
        <User size={16} color="#5e72e4" />
        <Text style={styles.userText}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            disabled={saving}
            style={styles.backButton}
          >
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Incident Tracker</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>Log New Incident</Text>
            <View style={styles.formIndicator} />
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRowLarge}>
              <Calendar size={20} color="#5e72e4" />
              <Text style={styles.infoText}>{date}</Text>
              <Clock size={20} color="#5e72e4" style={styles.timeIcon} />
              <Text style={styles.infoText}>{time}</Text>
            </View>
            
            {userName && (
              <View style={[styles.infoRowLarge, styles.nameRow]}>
                <BookOpen size={20} color="#5e72e4" />
                <Text style={styles.infoText}>{userName}</Text>
              </View>
            )}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Describe what happened..."
            placeholderTextColor="#a0aec0"
            multiline
            value={incidentText}
            onChangeText={setIncidentText}
            editable={!saving}
            returnKeyType="done"
            blurOnSubmit
          />
          
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Save size={20} color="#fff" />
                <Text style={styles.saveText}>Save Incident</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Logs Section */}
        <View style={styles.logsContainer}>
          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>Incident History</Text>
            <View style={styles.logsIndicator} />
          </View>
          
          {loadingIncidents ? (
            <ActivityIndicator style={styles.loading} color="#5e72e4" size="large" />
          ) : (
            <FlatList
              data={incidents}
              keyExtractor={(item) => item.id}
              renderItem={renderIncident}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh}
                  colors={['#5e72e4']}
                  tintColor="#5e72e4"
                />
              }
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AlertCircle size={48} color="#cbd5e0" />
                  <Text style={styles.emptyText}>No incidents recorded yet</Text>
                  <Text style={styles.emptySubText}>Log your first incident above</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16, 
    backgroundColor: '#5e72e4',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingBottom: 20
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  title: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: '700',
    letterSpacing: 0.5 
  },
  formContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    margin: 16,
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  formIndicator: {
    height: 4,
    width: 40,
    backgroundColor: '#5e72e4',
    borderRadius: 2,
    marginLeft: 12
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#2d3748', 
    letterSpacing: 0.3
  },
  infoCard: {
    backgroundColor: '#f0f5ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  infoRowLarge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  nameRow: {
    marginTop: 6
  },
  infoText: { 
    marginLeft: 10, 
    fontSize: 16, 
    color: '#5e72e4', 
    fontWeight: '500'
  },
  input: { 
    backgroundColor: '#f8f9fe', 
    borderRadius: 12, 
    padding: 16, 
    minHeight: 120, 
    fontSize: 16, 
    color: '#2d3748', 
    marginBottom: 20,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  saveButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#5e72e4', 
    padding: 16, 
    borderRadius: 12,
    shadowColor: '#5e72e4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3
  },
  saveDisabled: { 
    opacity: 0.7 
  },
  saveText: { 
    marginLeft: 10, 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
    letterSpacing: 0.5
  },
  logsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 8
  },
  logsIndicator: {
    height: 4,
    width: 40,
    backgroundColor: '#5e72e4',
    borderRadius: 2,
    marginLeft: 12
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748'
  },
  list: { 
    paddingBottom: 20 
  },
  incidentItem: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#5e72e4'
  },
  firstIncident: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  lastIncident: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 0
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  incidentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5e72e4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  incidentMeta: {
    flex: 1
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metaText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#718096',
    fontWeight: '500'
  },
  divider: {
    height: 1,
    backgroundColor: '#edf2f7',
    marginVertical: 12
  },
  incidentText: { 
    fontSize: 15, 
    color: '#4a5568', 
    lineHeight: 22 
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  userText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#5e72e4',
    fontWeight: '600'
  },
  timeIcon: { 
    marginLeft: 16 
  },
  loading: { 
    marginTop: 40 
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 10
  },
  emptyText: {
    fontSize: 17,
    color: '#718096',
    fontWeight: '600',
    marginTop: 16
  },
  emptySubText: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 4
  }
});