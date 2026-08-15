import './src/global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { AiModalProvider } from './src/context/AiModalContext';
import AiAssistantModal from './src/components/AiAssistantModal';
import AiCompanion from './src/components/AiCompanion';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AudioOutputProvider } from './src/context/AudioOutputContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AccessibilityProvider, useAccessibility } from './src/context/AccessibilityContext';

function AppShell() {
  const { isDark } = useTheme();
  const { highContrast, reduceMotion } = useAccessibility();
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = highContrast
    ? {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: isDark ? '#5eead4' : '#006b62',
          background: isDark ? '#000000' : '#ffffff',
          card: isDark ? '#000000' : '#ffffff',
          text: isDark ? '#ffffff' : '#000000',
          border: isDark ? '#ffffff' : '#18181b',
        },
      }
    : baseTheme;

  return (
    <ErrorBoundary>
      <AiModalProvider>
        <NavigationContainer ref={navigationRef} theme={navigationTheme}>
          <RootNavigator reduceMotion={reduceMotion} />
        </NavigationContainer>
        <AiAssistantModal />
        <AiCompanion />
      </AiModalProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <LanguageProvider>
              <AudioOutputProvider>
                <AppShell />
              </AudioOutputProvider>
            </LanguageProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
