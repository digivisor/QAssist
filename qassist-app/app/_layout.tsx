import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text as RNText, TextInput } from 'react-native';
import 'react-native-reanimated';
import { useFonts, Poppins_300Light, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../context/ThemeContext';

// Splash screen'i font yüklenene kadar göster
SplashScreen.preventAutoHideAsync();

// Default font ayarları
const setDefaultFonts = () => {
  const oldRender = (RNText as any).render;
  (RNText as any).render = function (...args: any[]) {
    const origin = oldRender.call(this, ...args);
    return {
      ...origin,
      props: {
        ...origin.props,
        style: [{ fontFamily: 'Poppins_400Regular' }, origin.props.style],
      },
    };
  };

  const oldTextInputRender = (TextInput as any).render;
  (TextInput as any).render = function (...args: any[]) {
    const origin = oldTextInputRender.call(this, ...args);
    return {
      ...origin,
      props: {
        ...origin.props,
        style: [{ fontFamily: 'Poppins_400Regular' }, origin.props.style],
      },
    };
  };
};

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// StatusBar wrapper component to access theme context
function StatusBarWrapper() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Font yüklendiyse default fontları ayarla
      if (fontsLoaded) {
        setDefaultFonts();
      }
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <CustomThemeProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="otp-verification" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="task-detail/[id]" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
          </Stack>
          <StatusBarWrapper />
        </ThemeProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}
