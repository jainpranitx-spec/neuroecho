import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import SpotAiLieScreen from "../screens/games/SpotAiLieScreen";
import EraGuesserScreen from "../screens/games/EraGuesserScreen";
import RecipeRebuilderScreen from "../screens/games/RecipeRebuilderScreen";
import MotionMatchScreen from "../screens/games/MotionMatchScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: "800" } }}>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="SpotAiLie"
        component={SpotAiLieScreen}
        options={{ title: "Spot the AI Lie", headerBackTitle: "Hub" }}
      />
      <Stack.Screen
        name="EraGuesser"
        component={EraGuesserScreen}
        options={{ title: "Era Guesser", headerBackTitle: "Hub" }}
      />
      <Stack.Screen
        name="RecipeRebuilder"
        component={RecipeRebuilderScreen}
        options={{ title: "Recipe Rebuilder", headerBackTitle: "Hub" }}
      />
      <Stack.Screen
        name="MotionMatch"
        component={MotionMatchScreen}
        options={{ title: "Motion Match", headerBackTitle: "Hub" }}
      />
    </Stack.Navigator>
  );
}
