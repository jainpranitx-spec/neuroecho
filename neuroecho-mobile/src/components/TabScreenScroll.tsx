import React from "react";
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

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
  ...rest
}: ScrollViewProps & { contentContainerStyle?: StyleProp<ViewStyle> }) {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScrollView
      {...rest}
      contentContainerStyle={[
        { padding: 16, gap: 24, paddingBottom: tabBarHeight + 24 },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}
