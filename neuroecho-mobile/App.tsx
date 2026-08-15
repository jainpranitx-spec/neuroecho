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

function AppShell() {
  const { isDark } = useTheme();

  return (
    <ErrorBoundary>
      <AiModalProvider>
        <NavigationContainer ref={navigationRef} theme={isDark ? DarkTheme : DefaultTheme}>
          <RootNavigator />
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
          <LanguageProvider>
            <AudioOutputProvider>
              <AppShell />
            </AudioOutputProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
