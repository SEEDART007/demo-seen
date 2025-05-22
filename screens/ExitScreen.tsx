import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ExitScreen() {
  const mockWeather = {
    location: 'Springfield, IL',
    condition: 'Partly Cloudy',
    temperature: '68°F',
    high: '72°F',
    low: '55°F',
  };

  const mockNews = [
    'Local farmers market opens this weekend.',
    'City council discusses new bike lanes.',
    'Community theater announces summer lineup.',
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.appName}>City Weather & News</Text>

      <View style={styles.weatherCard}>
        <Text style={styles.location}>{mockWeather.location}</Text>
        <Text style={styles.condition}>{mockWeather.condition}</Text>
        <Text style={styles.temp}>{mockWeather.temperature}</Text>
        <Text style={styles.range}>H: {mockWeather.high} / L: {mockWeather.low}</Text>
      </View>

      <Text style={styles.sectionTitle}>Top Local Stories</Text>
      {mockNews.map((headline, idx) => (
        <Text key={idx} style={styles.newsItem}>• {headline}</Text>
      ))}

      <Text style={styles.footer}>Updated just now • Powered by Weatherly</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  weatherCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 5,
  },
  condition: {
    fontSize: 18,
    color: '#fff',
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  range: {
    fontSize: 16,
    color: '#ddd',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 10,
    color: '#333',
  },
  newsItem: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  footer: {
    marginTop: 30,
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },
});
