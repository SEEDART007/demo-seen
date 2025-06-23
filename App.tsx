import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import { View, ActivityIndicator } from 'react-native';

// Screens
import PhoneSignin from './screens/PhoneSignin';
import HomeScreen from './screens/HomeScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import SafetyPlanScreen from './screens/SafetyPlanScreen';
import ExitScreen from './screens/ExitScreen';
import LogIncidentScreen from './screens/LogIncidentScreen';
import PoliceStationsScreen from './screens/PoliceStationScreen';
import VoiceTriggerSetupScreen from './screens/VoiceTriggerSetupScreen';
import QuizScreen from './screens/QuizScreen';
import QuizResults from './screens/QuizResults';
import MentalHealthScreen from './screens/MentalHealthScreen';
import Articles from './screens/Articles';
import LegalScreen from './screens/LegalScreen'; // Add LegalScreen import
import ImpWebScreen from './screens/ImpWebScreen'
import LiveAgressionDetection from './screens/LiveAgressionDetection';
import ProfileScreen from './screens/Profile';
// Community Chat Screens
import CommunityScreen from './screens/CommunityScreen';
import GroupChatScreen from './screens/GroupChat';

// Context
import { ThemeProvider } from './context/ThemeContext';
import LegalAdvisor from './screens/LegalAdvisor';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(u => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Login" component={PhoneSignin} />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Emergency" component={EmergencyScreen} />
              <Stack.Screen name="Resources" component={ResourcesScreen} />
              <Stack.Screen name="SafetyPlan" component={SafetyPlanScreen} />
              <Stack.Screen name="LogIncident" component={LogIncidentScreen} />
              <Stack.Screen name="PoliceStations" component={PoliceStationsScreen} />
              <Stack.Screen name="VoiceTrigger" component={VoiceTriggerSetupScreen} />
              <Stack.Screen name="Exit" component={ExitScreen} />
              <Stack.Screen name="Quiz" component={QuizScreen} />
              <Stack.Screen name="Result" component={QuizResults} />
              <Stack.Screen name="MentalHealth" component={MentalHealthScreen} />
              <Stack.Screen name="News" component={Articles} />
              <Stack.Screen name="CommunityScreen" component={CommunityScreen} />
              <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />
              <Stack.Screen name="LegalAdvisor" component={LegalAdvisor} />
              <Stack.Screen name="Websites" component={ImpWebScreen} />
                 <Stack.Screen 
          name="LiveAggressionDetection" 
          component={LiveAgressionDetection} 
          options={{ title: 'Live Aggression Detection' }} 
        />
              {/* Add LegalScreen to navigation stack */}
              <Stack.Screen name="Legal" component={LegalScreen} />
              <Stack.Screen 
  name="Profile" 
  component={ProfileScreen} 
  options={{ title: 'Your Profile' }}
/>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}