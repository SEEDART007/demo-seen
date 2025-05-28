import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function ExitScreen() {
  const mockWeather = {
    location: 'Springfield, IL',
    condition: 'Partly Cloudy',
    temperature: '68°F',
    high: '72°F',
    low: '55°F',
    humidity: '65%',
    wind: '8 mph',
    feelsLike: '70°F'
  };

  const mockNews = [
    {id: 1, headline: 'Local farmers market opens this weekend', category: 'Community'},
    {id: 2, headline: 'City council discusses new bike lanes initiative', category: 'Politics'},
    {id: 3, headline: 'Community theater announces summer lineup', category: 'Entertainment'},
    {id: 4, headline: 'New park opens downtown with eco-friendly design', category: 'Environment'},
  ];

  return (
    <ImageBackground 
      source={{uri: 'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?q=80&w=1000'}} 
      style={styles.background}
      blurRadius={3}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appName}>CityScape</Text>
          <Text style={styles.subtitle}>Your Local Weather & News</Text>
        </View>

        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <Text style={styles.location}>{mockWeather.location}</Text>
            <Text style={styles.condition}>{mockWeather.condition}</Text>
          </View>
          
          <View style={styles.tempContainer}>
            <Text style={styles.temp}>{mockWeather.temperature}</Text>
            <View style={styles.rangeContainer}>
              <Text style={styles.range}>↑ {mockWeather.high}</Text>
              <Text style={styles.range}>↓ {mockWeather.low}</Text>
            </View>
          </View>
          
          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{mockWeather.humidity}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>{mockWeather.wind}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Feels Like</Text>
              <Text style={styles.detailValue}>{mockWeather.feelsLike}</Text>
            </View>
          </View>
        </View>

        <View style={styles.newsContainer}>
          <Text style={styles.sectionTitle}>Today's Top Stories</Text>
          
          {mockNews.map((item) => (
            <TouchableOpacity key={item.id} style={styles.newsCard} activeOpacity={0.9}>
              <View style={styles.newsContent}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.newsHeadline}>{item.headline}</Text>
              </View>
              <View style={styles.readMore}>
                <Text style={styles.readMoreText}>Read →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Updated just now</Text>
          <View style={styles.divider} />
          <Text style={styles.footerText}>Powered by CityScape Insights</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0a192f',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    padding: 25,
    width: '100%',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  weatherHeader: {
    marginBottom: 15,
  },
  location: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  condition: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 20,
  },
  temp: {
    fontSize: 62,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  rangeContainer: {
    alignItems: 'flex-end',
  },
  range: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 3,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  newsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 25,
    padding: 25,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2D3A',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#6C63FF',
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  newsContent: {
    flex: 1,
    marginRight: 10,
  },
  categoryTag: {
    backgroundColor: '#F0EDFF',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
  },
  newsHeadline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2D3A',
    lineHeight: 22,
  },
  readMore: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
  },
});