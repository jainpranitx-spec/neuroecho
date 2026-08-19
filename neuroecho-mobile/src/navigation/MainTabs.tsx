import React from "react";
import { Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BarChart2, Brain, Mic, Settings as SettingsIcon } from "lucide-react-native";
import HubScreen from "../screens/HubScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useAiModal } from "../context/AiModalContext";
import { useLanguage } from "../context/LanguageContext";
import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

function CompanionHeaderButton() {
  const { openCompanion } = useAiModal();
  const { t } = useLanguage();
  return (
    <Pressable
      onPress={openCompanion}
      accessibilityRole="button"
      className="h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-teal-700 shadow-lg"
      accessibilityLabel={t("companion_fab_label")}
      accessibilityHint={t("companion_tap_to_speak")}
    >
      <Mic size={30} color="white" />
    </Pressable>
  );
}

export default function MainTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <CompanionHeaderButton />,
        headerStyle: { height: 76 },
        headerRightContainerStyle: { paddingRight: 12 },
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
