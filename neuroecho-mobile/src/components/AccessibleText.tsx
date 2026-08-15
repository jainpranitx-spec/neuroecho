import React from "react";
import { Text as NativeText, TextProps } from "react-native";
import { useAccessibility } from "../context/AccessibilityContext";
import { useTheme } from "../context/ThemeContext";

const TAILWIND_SIZES: Record<string, { fontSize: number; lineHeight: number }> = {
  "text-xs": { fontSize: 12, lineHeight: 16 },
  "text-sm": { fontSize: 14, lineHeight: 20 },
  "text-base": { fontSize: 16, lineHeight: 24 },
  "text-lg": { fontSize: 18, lineHeight: 28 },
  "text-xl": { fontSize: 20, lineHeight: 28 },
  "text-2xl": { fontSize: 24, lineHeight: 32 },
  "text-3xl": { fontSize: 30, lineHeight: 36 },
  "text-4xl": { fontSize: 36, lineHeight: 40 },
  "text-5xl": { fontSize: 48, lineHeight: 48 },
};

function getDeclaredSize(className?: string) {
  if (!className) return undefined;
  const arbitrary = className.match(/text-\[(\d+)px\]/);
  if (arbitrary) {
    const fontSize = Number(arbitrary[1]);
    return { fontSize, lineHeight: fontSize * 1.4 };
  }
  const declared = Object.entries(TAILWIND_SIZES).find(([token]) => className.split(/\s+/).includes(token))?.[1];
  if (declared && className.includes("leading-relaxed")) {
    return { ...declared, lineHeight: declared.fontSize * 1.625 };
  }
  return declared;
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
        { flexShrink: 1 },
        style,
        declaredSize && fontScale !== 1
          ? { fontSize: declaredSize.fontSize * fontScale, lineHeight: declaredSize.lineHeight * fontScale }
          : undefined,
        highContrast && usesMutedText ? { color: isDark ? "#ffffff" : "#3f3f46" } : undefined,
      ]}
    />
  );
}
