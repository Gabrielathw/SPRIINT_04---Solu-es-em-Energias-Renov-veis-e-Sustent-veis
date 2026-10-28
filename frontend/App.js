import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './screens/context/ThemeContext';
import { CardProvider } from './screens/context/CardContext'; // <-- Importação necessária

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import NovaRecargaScreen from './screens/NovaRecargaScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import StationScreen from './screens/StationScreen';
import PaymentScreen from './screens/PaymentScreen';
import SuccessScreen from './screens/SuccessScreen';
import SchedulePaymentScreen from './screens/SchedulePaymentScreen'; 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }) {
  const { username } = route.params;
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: { backgroundColor: theme.card, borderTopWidth: 2, borderColor: theme.bg }
    }}>
      <Tab.Screen 
        name="Início" component={HomeScreen} initialParams={{ username }} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color} /> }} 
      />
      <Tab.Screen 
        name="Histórico" component={HistoryScreen} initialParams={{ username }} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="time" size={24} color={color} /> }} 
      />
      <Tab.Screen 
        name="Configurações" component={SettingsScreen} initialParams={{ username }} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="settings" size={24} color={color} /> }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      {/* O CardProvider precisa estar aqui envolvendo tudo */}
      <CardProvider> 
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            
            <Stack.Screen name="NovaRecarga" component={NovaRecargaScreen} />
            <Stack.Screen name="StationScreen" component={StationScreen} />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
            <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
            
            <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} /> 
            <Stack.Screen name="SchedulePaymentScreen" component={SchedulePaymentScreen} /> 
            
          </Stack.Navigator>
        </NavigationContainer>
      </CardProvider>
    </ThemeProvider>
  );
}