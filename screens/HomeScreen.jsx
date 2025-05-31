import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {
  Phone,
  BookOpen,
  Shield,
  ClipboardList,
  Mic,
  MapPin,
  DoorOpen,
  LogOut,
  Sun,
  Moon,
  Users
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { theme, toggleTheme } = useTheme();
  
  const isDarkMode = theme === 'dark';
  
  // Define styles based on theme
  const styles = getStyles(isDarkMode);

  // Load user name on component mount
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        if (name) setUserName(name);
      } catch (error) {
        console.error('Failed to load user name:', error);
      }
    };
    
    loadUserName();
    
    // Animation setup
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 12,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('userName');
      Alert.alert('Logged out', 'You have been signed out.');
      navigation.replace('AuthStack');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const features = [
    {
      icon: <Phone color="#fff" size={28} />,
      title: 'Emergency Help',
      screen: 'Emergency',
      color: '#ef4444'
    },
    {
      icon: <BookOpen color="#fff" size={28} />,
      title: 'Resources',
      screen: 'Resources',
      color: '#3b82f6'
    },
    {
      icon: <Shield color="#fff" size={28} />,
      title: 'Safety Plan',
      screen: 'SafetyPlan',
      color: '#10b981'
    },
    {
      icon: <ClipboardList color="#fff" size={28} />,
      title: 'Log Incident',
      screen: 'LogIncident',
      color: '#f59e0b'
    },
    {
      icon: <Mic color="#fff" size={28} />,
      title: 'Voice Trigger',
      screen: 'VoiceTrigger',
      color: '#8b5cf6'
    },
    {
      icon: <MapPin color="#fff" size={28} />,
      title: 'Police Stations',
      screen: 'PoliceStations',
      color: '#06b6d4'
    },
    {
      icon: <ClipboardList color="#fff" size={28} />,
      title: 'Abuse Quiz',
      screen: 'Quiz',
      color: '#ec4899'
    },
    {
      icon: <BookOpen color="#fff" size={28} />,
      title: 'Latest Articles',
      screen: 'News',
      color: '#0ea5e9',
    },
    {
      icon: <Sun color="#fff" size={28} />,
      title: 'Mental Health',
      screen: 'MentalHealth',
      color: '#14b8a6'
    },
    {
  icon: <Users color="#fff" size={28} />,
  title: 'Community Chat',
  screen: 'CommunityScreen',
  color: '#6366f1' // you can change this to any Tailwind or HEX color
}
  ];

  const floatInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8]
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Animated Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut color={isDarkMode ? "#fff" : "#6C63FF"} size={26} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleTheme}
            activeOpacity={0.7}
            style={styles.themeToggle}
          >
            <Animated.View style={[styles.headerIcon, {
              transform: [{ translateY: floatInterpolation }]
            }]}>
              {isDarkMode ? 
                <Sun color="#FFD700" size={36} /> : 
                <Moon color="#6C63FF" size={36} />
              }
            </Animated.View>
          </TouchableOpacity>

          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }}>
            <Text style={styles.title}>Hope Connect</Text>
            <Text style={styles.subtitle}>
              {userName ? `Welcome back, ${userName}!` : "Welcome!"}
            </Text>
            <Text style={styles.subtitle}>You are not alone. We're here to help.</Text>
          </Animated.View>

          {/* Floating Background Bubbles */}
          <View style={styles.bubbleContainer}>
            {[...Array(6)].map((_, i) => (
              <Animated.View
                key={i}
                style={[styles.bubble, {
                  transform: [{
                    rotate: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${i % 2 ? 45 : -45}deg`]
                    })
                  }]
                }]}
              />
            ))}
          </View>
        </View>

        {/* Quick Exit */}
        <TouchableOpacity
          style={styles.quickExit}
          onPress={() => navigation.navigate('Exit')}
          activeOpacity={0.8}
        >
          <DoorOpen color="#fff" size={20} />
          <Text style={styles.quickExitText}>Quick Exit</Text>
        </TouchableOpacity>

        {/* Features Grid */}
        <View style={styles.grid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: feature.color }]}
              onPress={() => navigation.navigate(feature.screen)}
              activeOpacity={0.8}
            >
              <View style={styles.cardIcon}>{feature.icon}</View>
              <Text style={styles.cardTitle}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Dynamic styles based on theme
const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#f8fafc',
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: isDarkMode ? '#1a1a2e' : '#6C63FF',
    padding: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 24,
    overflow: 'hidden',
    paddingTop: 60,
  },
  headerIcon: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)',
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 6,
    fontStyle: 'italic',
  },
  quickExit: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickExitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  card: {
    width: (width - 48) / 2,
    borderRadius: 20,
    padding: 20,
    aspectRatio: 1,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 30,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  bubbleContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    opacity: 0.2,
  },
  bubble: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 6,
    marginTop: 20,
  },
  themeToggle: {
  // position: 'absolute',
  // top: '50%',
  // left: '55%',
  zIndex: 10,
  // transform: [{ translateX: '-50%' }, { translateY: '-50%' }]
 
}
});

export default HomeScreen;