import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import AppsScreen from '../screens/AppsScreen';
import TimerEditScreen from '../screens/TimerEditScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../theme/ThemeProvider';

export type RootStackParamList = {
  Tabs: undefined;
  TimerEdit: { id?: string; packageName?: string; appLabel?: string };
  Permissions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

function TabsNav() {
  const { tokens } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: tokens.bg },
        headerTitleStyle: { color: tokens.text, fontWeight: '700' },
        tabBarStyle: { backgroundColor: tokens.surface, borderTopColor: tokens.border },
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.textMuted,
      }}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>◴</Text> }} />
      <Tabs.Screen name="Apps" component={AppsScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>▦</Text> }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙</Text> }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { tokens } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: tokens.bg }, headerTitleStyle: { color: tokens.text }, headerTintColor: tokens.accent }}>
      <Stack.Screen name="Tabs" component={TabsNav} options={{ headerShown: false }} />
      <Stack.Screen name="TimerEdit" component={TimerEditScreen} options={{ title: 'Timer' }} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} options={{ title: 'Permissions' }} />
    </Stack.Navigator>
  );
}
