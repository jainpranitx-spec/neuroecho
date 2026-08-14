import './src/global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AiModalProvider } from './src/context/AiModalContext';
import AiAssistantModal from './src/components/AiAssistantModal';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function AppShell() {
  const { isDark } = useTheme();

  return (
    <ErrorBoundary>
      <AiModalProvider>
        <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
          <RootNavigator />
        </NavigationContainer>
        <AiAssistantModal />
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
          <AppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
