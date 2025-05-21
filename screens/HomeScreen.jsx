import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  BackHandler,
  Linking,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const handleQuickExit = () => {
    // Opens a safe/neutral website — can be changed
    navigation.navigate('Exit');

    // Optional: Exit the app (Android only)
    // BackHandler.exitApp(); // Uncomment only if really necessary
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Hope Connect</Text>
        <Text style={styles.subtitle}>You are not alone. We're here to help.</Text>

        <TouchableOpacity style={styles.buttonEscape} onPress={handleQuickExit}>
          <Text style={styles.buttonText}>🚪 Quick Exit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Emergency')}
        >
          <Text style={styles.buttonText}>📞 Emergency Help</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Resources')}
        >
          <Text style={styles.buttonText}>📚 Resources</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SafetyPlan')}
        >
          <Text style={styles.buttonText}>🛡️ Create Safety Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LogIncident')}
        >
          <Text style={styles.buttonText}>📝 Log an Incident</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f6fb',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b3b3b',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6a6a6a',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  buttonEscape: {
    backgroundColor: '#e63946',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
