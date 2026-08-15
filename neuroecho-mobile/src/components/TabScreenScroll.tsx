import React from "react";
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAccessibility } from "../context/AccessibilityContext";
import { useTheme } from "../context/ThemeContext";

/**
 * A ScrollView for screens nested inside the bottom tab navigator.
 *
 * React Navigation's bottom tab bar floats over screen content by default —
 * a plain ScrollView doesn't know the bar exists, so the last section's
 * text ends up rendering underneath (visually overlapping) the tab bar's
 * own labels. This reserves that space automatically.
 */
export default function TabScreenScroll({
  children,
  contentContainerStyle,
  style,
  ...rest
}: ScrollViewProps & { contentContainerStyle?: StyleProp<ViewStyle> }) {
  const tabBarHeight = useBottomTabBarHeight();
  const { highContrast } = useAccessibility();
  const { isDark } = useTheme();

  return (
    <ScrollView
      {...rest}
      style={[style, highContrast ? { backgroundColor: isDark ? "#000000" : "#ffffff" } : undefined]}
      contentContainerStyle={[
        { padding: 16, gap: 24, paddingBottom: tabBarHeight + 24 },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}
