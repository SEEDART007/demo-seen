import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function LogIncidentScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log an Incident</Text>
      <Text style={styles.text}>Documnt what happened with date/time</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} color="#6C63FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 }
});