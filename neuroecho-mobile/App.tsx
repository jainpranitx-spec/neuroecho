import './src/global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AiModalProvider } from './src/context/AiModalContext';
import AiAssistantModal from './src/components/AiAssistantModal';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AiModalProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <AiAssistantModal />
        </AiModalProvider>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
