import React from "react";
import { Image, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BarChart2, Brain, Mic, Settings as SettingsIcon } from "lucide-react-native";
import HubScreen from "../screens/HubScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useAiModal } from "../context/AiModalContext";
import { useLanguage } from "../context/LanguageContext";
import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

function NeuroEchoLogo() {
  return (
    <Image
      source={require("../../assets/neuroecho-logo.png")}
      accessibilityLabel="NeuroEcho"
      resizeMode="contain"
      style={{ width: 200, height: 36 }}
    />
  );
}

function CompanionHeaderButton() {
  const { openCompanion } = useAiModal();
  const { t } = useLanguage();
  return (
    <Pressable
      onPress={openCompanion}
      accessibilityRole="button"
      className="h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-teal-700 shadow-lg"
      accessibilityLabel={t("companion_fab_label")}
      accessibilityHint={t("companion_tap_to_speak")}
    >
      <Mic size={36} color="white" />
    </Pressable>
  );
}

export default function MainTabs() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <CompanionHeaderButton />,
        // Only iOS headers include the safe-area inset in their configured
        // height. This leaves Android's already-correct 92px header intact.
        headerStyle: {
          height: Platform.OS === "ios" ? insets.top + 72 : 92,
          backgroundColor: "#2bb1be",
        },
        headerShadowVisible: false,
        headerRightContainerStyle: { paddingRight: 12 },
        headerTitleContainerStyle: { left: 16, right: 96 },
        tabBarActiveTintColor: "#0f766e",
        tabBarInactiveTintColor: "#52525b",
        headerTitleStyle: { fontWeight: "800", fontSize: 22 },
        tabBarStyle: { height: 76, paddingTop: 8, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 14, fontWeight: "700" },
      }}
    >
      <Tab.Screen
        name="Hub"
        component={HubScreen}
        options={{
          title: t("nav_title"),
          headerTitle: () => <NeuroEchoLogo />,
          tabBarLabel: t("tab_hub"),
          tabBarIcon: ({ color, size }) => <Brain color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: t("nav_analytics_title"),
          tabBarLabel: t("tab_analytics"),
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t("nav_settings_title"),
          tabBarLabel: t("tab_settings"),
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
