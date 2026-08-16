import React from "react";
import { Pressable } from "react-native";
import Text from "../components/AccessibleText";
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
  const { t } = useLanguage();
  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      className="mr-3 min-h-12 flex-row items-center gap-2 rounded-2xl bg-teal-700 px-4 py-2"
      accessibilityLabel={`${t("nav_help")}: NeuroEcho AI`}
    >
      <Sparkles size={20} color="white" />
      <Text className="text-base font-bold text-white">{t("nav_help")}</Text>
    </Pressable>
  );
}

export default function MainTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <AskAiHeaderButton />,
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
