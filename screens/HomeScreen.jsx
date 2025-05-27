import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Heart,
  Phone,
  BookOpen,
  Shield,
  ClipboardList,
  Mic,
  MapPin,
  DoorOpen,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
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
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Heart fill="#ef4444" color="#fff" size={32} />
          </View>
          <Text style={styles.title}>Hope Connect</Text>
          <Text style={styles.subtitle}>You are not alone. We're here to help.</Text>
        </View>

        {/* Quick Exit */}
        <TouchableOpacity 
          style={styles.quickExit}
          onPress={() => navigation.navigate('Exit')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#6C63FF',
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
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
    elevation: 2,
  },
  quickExitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
  },
  card: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 20,
    aspectRatio: 1,
    justifyContent: 'space-between',
    elevation: 2,
  },
  cardIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export default HomeScreen;
