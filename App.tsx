import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import LiveTVScreen from './src/screens/LiveTVScreen';
import MoviesScreen from './src/screens/MoviesScreen';
import SeriesScreen from './src/screens/SeriesScreen';
import SeriesDetailsScreen from './src/screens/SeriesDetailsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { StorageService } from './src/services';
import PlayerScreen from './src/screens/PlayerScreen';
import type { Channel } from './src/services/IPTVService';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  LiveTV: undefined;
  Movies: undefined;
  Series: undefined;
  SeriesDetails: { series: any; seriesInfo?: any };
  Settings: undefined;
  Player: { channel: Channel };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    checkCredentials();
  }, []);

  const checkCredentials = async () => {
    const credentials = await StorageService.getCredentials();
    setInitialRoute(credentials ? 'Home' : 'Login');
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LiveTV" component={LiveTVScreen} />
        <Stack.Screen name="Movies" component={MoviesScreen} />
        <Stack.Screen name="Series" component={SeriesScreen} />
        <Stack.Screen name="SeriesDetails" component={SeriesDetailsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
