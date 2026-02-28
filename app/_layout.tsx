import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

// 1. Importamos TU ThemeProvider (el que creamos en context)
import { ThemeProvider } from '../context/ThemeContext';
import { VotingProvider } from '@/context/VotingContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'F1-Bold': require('../assets/fonts/Formula1-Bold.ttf'),
    'F1-Regular': require('../assets/fonts/Formula1-Regular.ttf'),
    'F1-Wide': require('../assets/fonts/Formula1-Wide.ttf'),
    'F1-Black': require('../assets/fonts/Formula1-Black.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Envolvemos toda la navegación con tu ThemeProvider personalizado
  return (
    <VotingProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </VotingProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      {/* HomeScreen ahora vive dentro de (tabs), pero lo dejamos por si acaso */}
      <Stack.Screen name="HomeScreen" /> 
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}