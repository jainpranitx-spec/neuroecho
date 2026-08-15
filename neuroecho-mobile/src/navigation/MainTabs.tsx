import React from "react";
import { Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BarChart2, Brain, Settings as SettingsIcon, Sparkles } from "lucide-react-native";
import HubScreen from "../screens/HubScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useAiModal } from "../context/AiModalContext";
import { useLanguage } from "../context/LanguageContext";
import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

function AskAiHeaderButton() {
  const { open } = useAiModal();
  return (
    <Pressable
      onPress={open}
      hitSlop={12}
      className="mr-4 flex-row items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2"
      accessibilityLabel="Ask NeuroEcho AI"
    >
      <Sparkles size={14} color="white" />
    </Pressable>
  );
}

export default function MainTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <AskAiHeaderButton />,
        tabBarActiveTintColor: "#0d9488",
        tabBarInactiveTintColor: "#a1a1aa",
        headerTitleStyle: { fontWeight: "800" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Hub"
        component={HubScreen}
        options={{
          title: t("nav_title"),
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
