// screens/ExitScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExitScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.text}>Heres todays news, weather, and helpful info.</Text>
      {/* Add more neutral content if you want */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
