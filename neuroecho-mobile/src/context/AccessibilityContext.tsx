import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccessibilityInfo } from "react-native";
import { setVoiceFeedbackEnabled } from "../lib/speech";

export type AppTextSize = "standard" | "large" | "extraLarge";

interface AccessibilityPreferences {
  textSize: AppTextSize;
  highContrast: boolean;
  reduceMotion: boolean;
  voiceFeedback: boolean;
}

interface AccessibilityContextValue extends AccessibilityPreferences {
  fontScale: number;
  setTextSize: (value: AppTextSize) => void;
  setHighContrast: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
  setVoiceFeedback: (value: boolean) => void;
}

const STORAGE_KEY = "neuroecho.accessibility.v1";
const DEFAULTS: AccessibilityPreferences = {
  // A slightly larger default makes the first launch comfortable without
  // overriding the device's own Dynamic Type / font-size preference.
  textSize: "large",
  highContrast: false,
  reduceMotion: false,
  voiceFeedback: true,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AccessibilityInfo.isReduceMotionEnabled()])
      .then(([stored, systemReduceMotion]) => {
        const saved = stored ? (JSON.parse(stored) as Partial<AccessibilityPreferences>) : {};
        const next = { ...DEFAULTS, ...saved };
        if (stored === null && systemReduceMotion) next.reduceMotion = true;
        setPreferences(next);
        setVoiceFeedbackEnabled(next.voiceFeedback);
      })
      .catch((error) => console.warn("[AccessibilityProvider] failed to load preferences", error))
      .finally(() => setHydrated(true));
  }, []);

  const update = (patch: Partial<AccessibilityPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      setVoiceFeedbackEnabled(next.voiceFeedback);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((error) =>
        console.warn("[AccessibilityProvider] failed to save preferences", error)
      );
      return next;
    });
  };

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      ...preferences,
      fontScale: preferences.textSize === "extraLarge" ? 1.3 : preferences.textSize === "large" ? 1.15 : 1,
      setTextSize: (textSize) => update({ textSize }),
      setHighContrast: (highContrast) => update({ highContrast }),
      setReduceMotion: (reduceMotion) => update({ reduceMotion }),
      setVoiceFeedback: (voiceFeedback) => update({ voiceFeedback }),
    }),
    [preferences]
  );

  if (!hydrated) return null;
  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return context;
}
