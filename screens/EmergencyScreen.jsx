import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function EmergencyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <Text style={styles.text}>National Domestic Violence Hotline: 1-800-799-7233</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} color="#6C63FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 }
});