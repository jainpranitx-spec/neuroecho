import React from "react";
import { Text as NativeText, TextProps } from "react-native";
import { useAccessibility } from "../context/AccessibilityContext";
import { useTheme } from "../context/ThemeContext";

const TAILWIND_SIZES: Record<string, number> = {
  "text-xs": 12,
  "text-sm": 14,
  "text-base": 16,
  "text-lg": 18,
  "text-xl": 20,
  "text-2xl": 24,
  "text-3xl": 30,
  "text-4xl": 36,
  "text-5xl": 48,
};

function getDeclaredSize(className?: string) {
  if (!className) return undefined;
  const arbitrary = className.match(/text-\[(\d+)px\]/);
  if (arbitrary) return Number(arbitrary[1]);
  return Object.entries(TAILWIND_SIZES).find(([token]) => className.split(/\s+/).includes(token))?.[1];
}

/**
 * Drop-in Text that adds the user's in-app text-size preference while still
 * allowing the operating system's font scaling and screen reader behavior.
 */
export default function AccessibleText({ className, style, ...props }: TextProps & { className?: string }) {
  const { fontScale, highContrast } = useAccessibility();
  const { isDark } = useTheme();
  const declaredSize = getDeclaredSize(className);
  const usesMutedText = className?.includes("text-zinc-400") || className?.includes("text-zinc-500");

  return (
    <NativeText
      {...props}
      className={className}
      allowFontScaling
      maxFontSizeMultiplier={2}
      style={[
        style,
        declaredSize && fontScale !== 1 ? { fontSize: declaredSize * fontScale } : undefined,
        highContrast && usesMutedText ? { color: isDark ? "#ffffff" : "#3f3f46" } : undefined,
      ]}
    />
  );
}
