// ProfileScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  SafeAreaView,
  Linking,
  Alert
} from 'react-native';
import { 
  ChevronRight, 
  Shield, 
  Bell, 
  Globe, 
  Sun,
  Moon,
  HelpCircle, 
  Lock, 
  LogOut,
  Mail,
  Phone,
  User,
  Edit,
  Star,
  ShieldCheck
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const styles = getStyles(isDarkMode);
  
  const [userData, setUserData] = useState({
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    phone: '+1 (555) 123-4567',
    emergencyContacts: 3,
    memberSince: '2023-05-15',
    safetyRating: 4.8
  });
  
  const [settings, setSettings] = useState({
    locationSharing: true,
    emergencyAlerts: true,
    darkMode: isDarkMode,
    appNotifications: true
  });
  
  const handleLogout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('userToken');
      Alert.alert('Logged out', 'You have been signed out safely.');
      navigation.replace('AuthStack');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  const handleContactPress = (contact) => {
    Alert.alert(
      'Contact Support',
      `Would you like to call or email our ${contact} team?`,
      [
        {
          text: 'Call',
          onPress: () => Linking.openURL('tel:+18005551234')
        },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@hopeconnect.com')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };
  
  const handleSettingToggle = (setting) => {
    if (setting === 'darkMode') {
      toggleTheme();
    }
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          fill={i <= Math.floor(userData.safetyRating) ? "#FFD700" : "transparent"} 
          color="#FFD700" 
          size={18} 
        />
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Edit color={isDarkMode ? "#fff" : "#6c63ff"} size={22} />
          </TouchableOpacity>
          
          <View style={styles.profileImageContainer}>
            <Image
              source={require('./pic1.jpg')} // Replace with your image path
              style={styles.profileImage}
            />
            <View style={styles.verifiedBadge}>
              <ShieldCheck color="#fff" size={16} />
            </View>
          </View>
          
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.emergencyContacts}</Text>
              <Text style={styles.statLabel}>Contacts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.safetyRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Safety Score</Text>
              {renderRatingStars()}
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Active Plans</Text>
            </View>
          </View>
        </View>
        
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoItem}>
            <User size={22} color={isDarkMode ? "#bbb" : "#666"} />
            <Text style={styles.infoText}>{userData.name}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Mail size={22} color={isDarkMode ? "#bbb" : "#666"} />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Phone size={22} color={isDarkMode ? "#bbb" : "#666"} />
            <Text style={styles.infoText}>{userData.phone}</Text>
          </View>
          
          <View style={[styles.infoItem, styles.lastItem]}>
            <ShieldCheck size={22} color={isDarkMode ? "#bbb" : "#666"} />
            <Text style={styles.infoText}>Member since {userData.memberSince}</Text>
          </View>
        </View>
        
        {/* Safety Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={24} color="#ef4444" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Share My Location</Text>
                <Text style={styles.settingDescription}>Allow trusted contacts to see your location</Text>
              </View>
            </View>
            <Switch
              value={settings.locationSharing}
              onValueChange={() => handleSettingToggle('locationSharing')}
              trackColor={{ false: "#767577", true: isDarkMode ? "#4ade80" : "#10b981" }}
              thumbColor={settings.locationSharing ? "#fff" : "#f4f3f4"}
            />
          </View>
          
          <View style={[styles.settingItem, styles.lastItem]}>
            <View style={styles.settingInfo}>
              <Bell size={24} color="#f59e0b" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Emergency Alerts</Text>
                <Text style={styles.settingDescription}>Notify contacts in case of emergency</Text>
              </View>
            </View>
            <Switch
              value={settings.emergencyAlerts}
              onValueChange={() => handleSettingToggle('emergencyAlerts')}
              trackColor={{ false: "#767577", true: isDarkMode ? "#4ade80" : "#10b981" }}
              thumbColor={settings.emergencyAlerts ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>
        
        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              {isDarkMode ? (
                <Moon size={24} color="#8b5cf6" />
              ) : (
                <Sun size={24} color="#f59e0b" />
              )}
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  {isDarkMode ? 'Currently enabled' : 'Currently disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={() => handleSettingToggle('darkMode')}
              trackColor={{ false: "#767577", true: isDarkMode ? "#4ade80" : "#10b981" }}
              thumbColor={settings.darkMode ? "#fff" : "#f4f3f4"}
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Globe size={24} color="#3b82f6" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Language</Text>
                <Text style={styles.settingDescription}>English (Default)</Text>
              </View>
            </View>
            <ChevronRight color={isDarkMode ? "#aaa" : "#777"} size={22} />
          </TouchableOpacity>
          
          <View style={[styles.settingItem, styles.lastItem]}>
            <View style={styles.settingInfo}>
              <Bell size={24} color="#0ea5e9" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>Customize alerts and sounds</Text>
              </View>
            </View>
            <Switch
              value={settings.appNotifications}
              onValueChange={() => handleSettingToggle('appNotifications')}
              trackColor={{ false: "#767577", true: isDarkMode ? "#4ade80" : "#10b981" }}
              thumbColor={settings.appNotifications ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>
        
        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleContactPress('support')}
          >
            <View style={styles.settingInfo}>
              <HelpCircle size={24} color="#06b6d4" />
              <Text style={styles.settingTitle}>Contact Support</Text>
            </View>
            <ChevronRight color={isDarkMode ? "#aaa" : "#777"} size={22} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('SafetyTips')}
          >
            <View style={styles.settingInfo}>
              <Shield size={24} color="#10b981" />
              <Text style={styles.settingTitle}>Safety Tips & Guides</Text>
            </View>
            <ChevronRight color={isDarkMode ? "#aaa" : "#777"} size={22} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.lastItem]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.settingInfo}>
              <Lock size={24} color="#8b5cf6" />
              <Text style={styles.settingTitle}>Privacy & Security</Text>
            </View>
            <ChevronRight color={isDarkMode ? "#aaa" : "#777"} size={22} />
          </TouchableOpacity>
        </View>
        
        {/* Emergency Section */}
        <TouchableOpacity 
          style={[styles.emergencyButton, { backgroundColor: isDarkMode ? '#2c1a1a' : '#fee2e2' }]}
          onPress={() => navigation.navigate('Emergency')}
        >
          <Shield size={28} color="#ef4444" />
          <Text style={[styles.emergencyText, { color: '#ef4444' }]}>Emergency Settings</Text>
        </TouchableOpacity>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={22} color="#ef4444" />
          <Text style={[styles.logoutText, { color: '#ef4444' }]}>Sign Out</Text>
        </TouchableOpacity>
        
        {/* App Version */}
        <Text style={styles.versionText}>Hope Connect v2.4.1</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: isDarkMode ? '#1f1f1f' : '#6c63ff',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 10,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
    zIndex: 10,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: isDarkMode ? '#6c63ff' : '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#10b981',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: isDarkMode ? '#1f1f1f' : '#fff',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 24,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  starContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  section: {
    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: isDarkMode ? '#fff' : '#333',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333' : '#eee',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333' : '#eee',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  infoText: {
    fontSize: 16,
    color: isDarkMode ? '#e0e0e0' : '#555',
    marginLeft: 16,
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333' : '#eee',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTextContainer: {
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? '#fff' : '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: isDarkMode ? '#aaa' : '#777',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 12,
  },
  emergencyText: {
    fontSize: 17,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? '#333' : '#eee',
    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: isDarkMode ? '#666' : '#999',
    marginTop: 24,
  },
});

export default ProfileScreen;