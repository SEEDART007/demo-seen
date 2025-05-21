import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function SafetyPlanScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Safety Plan</Text>
      <Text style={styles.text}>Step 1: Identify safe areas in your home</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} color="#6C63FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 }
});