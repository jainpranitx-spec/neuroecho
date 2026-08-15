import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import SpotAiLieScreen from "../screens/games/SpotAiLieScreen";
import EraGuesserScreen from "../screens/games/EraGuesserScreen";
import RecipeRebuilderScreen from "../screens/games/RecipeRebuilderScreen";
import MotionMatchScreen from "../screens/games/MotionMatchScreen";
import ErrorBoundary from "../components/ErrorBoundary";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

// A game crashing shouldn't take the whole app down with it — each gets its
// own boundary so "Try Again" just re-mounts that one game.
function withGameBoundary(Screen: React.ComponentType, label: string) {
  return function Wrapped() {
    return (
      <ErrorBoundary label={label}>
        <Screen />
      </ErrorBoundary>
    );
  };
}

export default function RootNavigator({ reduceMotion = false }: { reduceMotion?: boolean }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: "800", fontSize: 20 },
        headerBackTitleStyle: { fontSize: 17 },
        animation: reduceMotion ? "none" : "default",
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="SpotAiLie"
        component={withGameBoundary(SpotAiLieScreen, "Spot the AI Lie")}
        options={{ title: "Spot the AI Lie", headerBackTitle: "Hub" }}
      />
      <Stack.Screen
        name="EraGuesser"
        component={withGameBoundary(EraGuesserScreen, "Era Guesser")}
        options={{ title: "Era Guesser", headerBackTitle: "Hub" }}
      />
      <Stack.Screen
        name="RecipeRebuilder"
        component={withGameBoundary(RecipeRebuilderScreen, "Recipe Rebuilder")}
        options={{ title: "Recipe Rebuilder", headerBackTitle: "Hub" }}
      />
      <Stack.Screen
        name="MotionMatch"
        component={withGameBoundary(MotionMatchScreen, "Motion Match")}
        options={{ title: "Motion Match", headerBackTitle: "Hub" }}
      />
    </Stack.Navigator>
  );
}
