import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Image } from 'react-native';
import { Shield, HeartHandshake, Phone, Globe, Info } from 'lucide-react-native';

const DomesticViolenceResources = () => {
  // Resource data with Indian domestic violence organizations
  const resources = [
    {
      id: 1,
      name: 'National Commission for Women',
      description: 'Official government body for women\'s rights',
      url: 'https://ncw.nic.in/',
      icon: <Shield size={28} color="#7e22ce" />
    },
    {
      id: 2,
      name: 'Women Helpline (All India)',
      description: 'Emergency support and counseling',
      url: 'tel:1091',
      icon: <Phone size={28} color="#dc2626" />
    },
    {
      id: 3,
      name: 'Sakhi - One Stop Centre',
      description: 'Government initiative for violence survivors',
      url: 'https://wcd.nic.in/schemes/sakhi-one-stop-centre-osc',
      icon: <HeartHandshake size={28} color="#059669" />
    },
    {
      id: 4,
      name: 'Majlis Legal Centre',
      description: 'Legal support for women survivors',
      url: 'https://majlis.org/',
      icon: <Info size={28} color="#2563eb" />
    },
    {
      id: 5,
      name: 'RAHI Foundation',
      description: 'Support for survivors of childhood abuse',
      url: 'https://www.rahifoundation.org/',
      icon: <Globe size={28} color="#ea580c" />
    }
  ];

  const handlePress = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Domestic Violence Support</Text>
        <Text style={styles.subtitle}>India's Trusted Resources</Text>
      </View>

      {/* Emergency Card */}
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <Shield size={24} color="#fff" />
          <Text style={styles.emergencyText}>Emergency Helpline</Text>
        </View>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => handlePress('tel:1091')}
        >
          <Text style={styles.emergencyButtonText}>Call 1091 (Women Helpline)</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => handlePress('tel:112')}
        >
          <Text style={styles.emergencyButtonText}>Call 112 (National Emergency)</Text>
        </TouchableOpacity>
      </View>

      {/* Resources Section */}
      <Text style={styles.sectionTitle}>Trusted Organizations</Text>
      
      {resources.map((resource) => (
        <TouchableOpacity 
          key={resource.id}
          style={styles.card}
          onPress={() => handlePress(resource.url)}
        >
          <View style={styles.cardHeader}>
            {resource.icon}
            <Text style={styles.cardTitle}>{resource.name}</Text>
          </View>
          <Text style={styles.cardDescription}>{resource.description}</Text>
          <View style={styles.linkContainer}>
            <Globe size={16} color="#6366f1" />
            <Text style={styles.linkText}>Visit Website</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Footer Note */}
      <Text style={styles.footerNote}>
        You are not alone. Reach out to these organizations for confidential support, 
        legal advice, and counseling services.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7e22ce',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
  },
  emergencyCard: {
    backgroundColor: '#9333ea',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emergencyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  emergencyButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#9333ea',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  cardDescription: {
    color: '#64748b',
    marginBottom: 15,
    lineHeight: 22,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 8,
  },
  footerNote: {
    textAlign: 'center',
    color: '#475569',
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default DomesticViolenceResources;