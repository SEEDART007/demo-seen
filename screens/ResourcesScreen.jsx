import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';

export default function ResourcesScreen({ navigation }) {
  const openLink = (url) => {
    Linking.openURL(url).catch(() => alert('Unable to open the link'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support & Resources</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Emergency Help */}
        <View style={styles.section}>
          <Text style={styles.heading}>🚨 Emergency Help</Text>
          <TouchableOpacity onPress={() => Linking.openURL('tel:8007997233')}>
            <Text style={styles.text}>📞 National DV Hotline: 1-800-799-7233</Text>
          </TouchableOpacity>
          <Text style={styles.text}>📱 Text “START” to 88788</Text>
          <Text style={styles.text}>🚓 Call 911 if you’re in immediate danger</Text>
        </View>

        {/* Local Support */}
        <View style={styles.section}>
          <Text style={styles.heading}>🏠 Local Support</Text>
          <Text style={styles.text}>🏡 Shelters – Safe housing and meals</Text>
          <Text style={styles.text}>👩‍⚖️ Legal Aid – Help with restraining orders & custody</Text>
          <Text style={styles.text}>🏥 Health Centers – Medical and emotional care</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PoliceStations')}>
            <Text style={styles.link}>📍 View Nearby Police Stations</Text>
          </TouchableOpacity>
        </View>

        {/* Counseling & Healing */}
        <View style={styles.section}>
          <Text style={styles.heading}>🧠 Mental Health & Healing</Text>
          <Text style={styles.text}>💬 Trauma-informed therapy (in-person / virtual)</Text>
          <Text style={styles.text}>👥 Support groups – Connect with survivors</Text>
          <TouchableOpacity onPress={() => openLink('https://www.opencounseling.com/')}>
            <Text style={styles.link}>🌐 Free Counseling Resources</Text>
          </TouchableOpacity>
        </View>

        {/* Tech Safety */}
        <View style={styles.section}>
          <Text style={styles.heading}>🔐 Tech Safety & Privacy</Text>
          <Text style={styles.text}>🧹 How to clear browser & app history</Text>
          <Text style={styles.text}>📵 Disable location/sharing on social media</Text>
          <TouchableOpacity onPress={() => openLink('https://www.techsafety.org/resources-survivors')}>
            <Text style={styles.link}>🔗 Visit TechSafety.org</Text>
          </TouchableOpacity>
        </View>

        {/* Rebuilding Tools */}
        <View style={styles.section}>
          <Text style={styles.heading}>💼 Rebuild & Restart</Text>
          <Text style={styles.text}>💰 Financial assistance and budgeting tools</Text>
          <Text style={styles.text}>👶 Childcare and education aid</Text>
          <TouchableOpacity onPress={() => openLink('https://www.womenslaw.org/')}>
            <Text style={styles.link}>⚖️ Legal Rights & FAQs – WomensLaw.org</Text>
          </TouchableOpacity>
        </View>

        {/* Educational Tools */}
        <View style={styles.section}>
          <Text style={styles.heading}>📚 Learn & Prepare</Text>
          <Text style={styles.text}>📄 Safety Planning Guide</Text>
          <Text style={styles.text}>📊 Quiz: Am I in an abusive relationship?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SafetyPlan')}>
            <Text style={styles.link}>📝 Create Your Safety Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 40, paddingHorizontal: 20 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6C63FF',
    textAlign: 'center',
  },
  scrollContent: { paddingBottom: 50 },
  section: { marginBottom: 30 },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    paddingLeft: 5,
  },
  link: {
    fontSize: 16,
    color: '#6C63FF',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  backButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
