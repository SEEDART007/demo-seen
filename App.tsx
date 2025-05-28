import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PoliceStationsScreen from './screens/PoliceStationScreen';
import VoiceTriggerSetupScreen from './screens/VoiceTriggerSetupScreen';
import QuizScreen from './screens/QuizScreen';
import QuizResults from './screens/QuizResults';


import HomeScreen from './screens/HomeScreen'; // make sure this path is correct
import EmergencyScreen from './screens/EmergencyScreen'; // dummy placeholders
import ResourcesScreen from './screens/ResourcesScreen';
import SafetyPlanScreen from './screens/SafetyPlanScreen';
import ExitScreen from './screens/ExitScreen';
import LogIncidentScreen from './screens/LogIncidentScreen';
import Articles from './screens/Articles'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
        <Stack.Screen name="Resources" component={ResourcesScreen} />
        <Stack.Screen name="SafetyPlan" component={SafetyPlanScreen} />
        <Stack.Screen name="LogIncident" component={LogIncidentScreen} />
        <Stack.Screen name="PoliceStations" component={PoliceStationsScreen} />
        <Stack.Screen name="VoiceTrigger" component={VoiceTriggerSetupScreen} />
        <Stack.Screen name="Exit" component={ExitScreen} options={{ headerShown: false }} />
         <Stack.Screen name="Quiz" component={QuizScreen} />
         <Stack.Screen name="News" component={Articles} />
        <Stack.Screen name="Result" component={QuizResults} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
