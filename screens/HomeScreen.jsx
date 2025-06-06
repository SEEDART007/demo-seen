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
  Users,
  Gavel,
  Leaf,
  Star
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [headerHeight, setHeaderHeight] = useState(0);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { theme, toggleTheme } = useTheme();
  
  const isDarkMode = theme === 'dark';
  const styles = getStyles(isDarkMode);
  
  // Array to store animations
  const leafAnimations = useRef([]);
  const starAnimations = useRef([]);
  
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
    
    // Floating animation
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

    // Fade and scale animation
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

  // Start animations when header height is available
  useEffect(() => {
    if (headerHeight > 0) {
      startLeafAnimations();
      startStarAnimations();
    }
  }, [headerHeight]);

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

  // Create and start leaf animations
  const startLeafAnimations = () => {
    leafAnimations.current = Array(20).fill().map((_, index) => {
      const translateY = new Animated.Value(-30);
      const translateX = new Animated.Value(0);
      const rotate = new Animated.Value(0);
      
      // Random properties
      const duration = 8000 + Math.random() * 7000;
      const startLeft = Math.random() * width;
      const drift = (Math.random() - 0.5) * 150;
      const rotation = Math.random() * 360;
      const size = 12 + Math.random() * 18;
      const opacity = 0.4 + Math.random() * 0.5;
      
      // Start animation
      Animated.loop(
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: headerHeight + 50,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: drift,
              duration: duration / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: drift * 1.5,
              duration: duration / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(rotate, {
            toValue: rotation + 720,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ])
      ).start();
      
      return {
        translateY,
        translateX,
        rotate,
        startLeft,
        size,
        opacity
      };
    });
  };

  // Create and start star animations
  const startStarAnimations = () => {
    starAnimations.current = Array(15).fill().map((_, index) => {
      const opacity = new Animated.Value(0.2);
      const scale = new Animated.Value(1);
      
      // Random properties
      const duration = 2000 + Math.random() * 3000;
      const delay = Math.random() * 2000;
      const startLeft = Math.random() * width;
      const startTop = 30 + Math.random() * (headerHeight / 2);
      const starSize = 1 + Math.random() * 3;
      
      // Start animation
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.3,
              duration: duration / 2,
              useNativeDriver: true,
            })
          ]),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0.2,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            })
          ])
        ])
      ).start();
      
      return {
        opacity,
        scale,
        startLeft,
        startTop,
        starSize
      };
    });
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
      color: '#6366f1'
    },
    {
      icon: <Gavel color="#fff" size={28} />,
      title: 'Legal Paperwork',
      screen: 'Legal',
      color: '#7e22ce'
    }
  ];

  const floatInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8]
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Nature-inspired Header */}
        <View 
          style={styles.header}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setHeaderHeight(height);
          }}
        >
          {/* Stars */}
          {isDarkMode && starAnimations.current.map((star, index) => (
            <Animated.View
              key={`star-${index}`}
              style={[
                styles.star,
                {
                  left: star.startLeft,
                  top: star.startTop,
                  width: star.starSize,
                  height: star.starSize,
                  opacity: star.opacity,
                  transform: [{ scale: star.scale }]
                }
              ]}
            />
          ))}

          {/* Falling Leaves */}
          {leafAnimations.current.map((leaf, index) => (
            <Animated.View
              key={`leaf-${index}`}
              style={[
                styles.leaf,
                {
                  left: leaf.startLeft,
                  opacity: leaf.opacity,
                  transform: [
                    { translateY: leaf.translateY },
                    { translateX: leaf.translateX },
                    { rotate: leaf.rotate.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg']
                      }) 
                    }
                  ]
                }
              ]}
            >
              <Leaf 
                color={isDarkMode ? "#c084fc" : "#4ade80"} 
                size={leaf.size} 
              />
            </Animated.View>
          ))}

          {/* Hill Silhouettes */}
          <View style={styles.hillContainer}>
            <View style={[styles.hill, styles.hill1]} />
            <View style={[styles.hill, styles.hill2]} />
            <View style={[styles.hill, styles.hill3]} />
          </View>

          {/* Header content */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut color={isDarkMode ? "#fff" : "#5D3FD3"} size={26} />
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
                <Moon color="#5D3FD3" size={36} />
              }
            </Animated.View>
          </TouchableOpacity>

          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            zIndex: 20
          }}>
            <Text style={styles.title}>Hope Connect</Text>
            <Text style={styles.subtitle}>
              {userName ? `Welcome back, ${userName}!` : "Welcome!"}
            </Text>
            <Text style={styles.subtitle}>You are not alone. We're here to help.</Text>
          </Animated.View>

          {/* Floating Background Bubbles */}
          <View style={styles.bubbleContainer}>
            {[...Array(8)].map((_, i) => (
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
    backgroundColor: isDarkMode ? '#1a1a2e' : '#5D3FD3',
    padding: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 24,
    overflow: 'hidden',
    paddingTop: 60,
    position: 'relative',
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
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 10,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 6,
    fontStyle: 'italic',
    zIndex: 10,
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
    zIndex: 30,
  },
  bubbleContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    opacity: 0.2,
    zIndex: 1,
  },
  bubble: {
    width: 12,
    height: 12,
    backgroundColor: isDarkMode ? 'rgba(192, 132, 252, 0.4)' : 'rgba(255,255,255,0.4)',
    borderRadius: 6,
    marginTop: 20,
  },
  themeToggle: {
    zIndex: 30,
  },
  // Leaf styles
  leaf: {
    position: 'absolute',
    top: -30,
    zIndex: 2,
  },
  // Hill styles
  hillContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // hill: {
  //   position: 'absolute',
  //   bottom: 0,
  //   backgroundColor: isDarkMode ? '#0f172a' : '#365314',
  //   borderTopLeftRadius: 30,
  //   borderTopRightRadius: 30,
  // },
  // hill1: {
  //   width: width * 0.5,
  //   height: 50,
  //   left: -width * 0.1,
  // },
  // hill2: {
  //   width: width * 0.4,
  //   height: 40,
  //   left: width * 0.3,
  // },
  // hill3: {
  //   width: width * 0.6,
  //   height: 45,
  //   right: -width * 0.1,
  // },
  // Star styles
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 50,
    zIndex: 1,
  },
});

export default HomeScreen;