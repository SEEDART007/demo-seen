import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { Phone, Lock, ChevronLeft, MessageCircle, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PhoneSignin = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [activeInput, setActiveInput] = useState(0);

  const animateScreen = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  useEffect(() => {
    animateScreen();
  }, []);

  const handleSendOtp = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    try {
      // Store name locally while processing OTP
      await AsyncStorage.setItem('userName', name.trim());
      
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      setIsLoading(false);
      animateScreen();
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const handleConfirmOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    try {
      await confirm.confirm(otp);
      
      // Store name permanently after successful auth
      await AsyncStorage.setItem('userName', name.trim());
      
      setIsLoading(false);
      navigation.replace('Home');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'The code you entered is invalid');
    }
  };

  const resetFlow = () => {
    setConfirm(null);
    setOtp('');
    animateScreen();
  };

  const renderOtpBoxes = () => {
    return Array(6).fill(0).map((_, index) => (
      <TouchableOpacity 
        key={index} 
        style={[
          styles.otpBox,
          otp[index] && styles.otpBoxFilled,
          index === activeInput && styles.otpBoxActive
        ]}
        onPress={() => setActiveInput(index)}
      >
        <Text style={styles.otpText}>{otp[index] || ''}</Text>
        {index === activeInput && <View style={styles.cursor} />}
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[
          styles.card, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}>
          {/* Header with back button when in OTP screen */}
          {confirm && (
            <TouchableOpacity onPress={resetFlow} style={styles.backButton}>
              <ChevronLeft size={28} color="#4f46e5" />
            </TouchableOpacity>
          )}
          
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {confirm ? (
                <View style={[styles.iconCircle, styles.otpCircle]}>
                  <Lock size={36} color="#4f46e5" />
                </View>
              ) : (
                <View style={[styles.iconCircle, styles.phoneCircle]}>
                  <Phone size={36} color="#4f46e5" />
                </View>
              )}
            </View>
            
            <Text style={styles.title}>
              {confirm ? 'Verify Phone Number' : 'Welcome!'}
            </Text>
            <Text style={styles.subtitle}>
              {confirm 
                ? `Enter the 6-digit code sent to ${phoneNumber}` 
                : 'Enter your details to get started'}
            </Text>
          </View>

          <View style={styles.form}>
            {!confirm ? (
              <>
                <View style={styles.inputContainer}>
                  <User size={24} color="#4f46e5" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor="#9ca3af"
                    onChangeText={setName}
                    value={name}
                    autoFocus
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Phone size={24} color="#4f46e5" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    onChangeText={setPhoneNumber}
                    value={phoneNumber}
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.otpContainer}>
                  {renderOtpBoxes()}
                </View>
                
                <TextInput
                  style={styles.hiddenInput}
                  keyboardType="number-pad"
                  onChangeText={(text) => {
                    setOtp(text);
                    setActiveInput(text.length < 6 ? text.length : 5);
                  }}
                  value={otp}
                  maxLength={6}
                  autoFocus
                />
                
                <TouchableOpacity 
                  style={[styles.button, styles.verifyButton]} 
                  onPress={handleConfirmOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity onPress={resetFlow} style={styles.resendContainer}>
                  <MessageCircle size={18} color="#4f46e5" />
                  <Text style={styles.linkText}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your information will be used for authentication purposes
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  phoneCircle: {
    backgroundColor: '#e0e7ff',
    borderWidth: 2,
    borderColor: '#c7d2fe',
  },
  otpCircle: {
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 17,
    color: '#1e293b',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
  },
  verifyButton: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  otpBox: {
    width: 52,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  otpBoxFilled: {
    backgroundColor: '#e0f2fe',
    borderColor: '#7dd3fc',
  },
  otpBoxActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#f0f9ff',
  },
  otpText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 28,
    backgroundColor: '#38bdf8',
    bottom: 16,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  linkText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PhoneSignin;