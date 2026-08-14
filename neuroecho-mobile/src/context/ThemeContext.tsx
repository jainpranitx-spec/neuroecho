import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme as nativewindColorScheme, useColorScheme } from "nativewind";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "neuroecho.themePreference";

interface ThemeContextValue {
  /** What the user picked (may be "system"). */
  preference: ThemePreference;
  /** The actual resolved scheme currently applied ("light" | "dark"). */
  colorScheme: "light" | "dark";
  setPreference: (pref: ThemePreference) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [hydrated, setHydrated] = useState(false);
  const { colorScheme } = useColorScheme();

  // Restore the saved preference once at startup, before rendering depends
  // on it — nativewindColorScheme.set() is the imperative (non-hook) form,
  // safe to call outside a component's render phase.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        const pref = (stored as ThemePreference | null) ?? "system";
        setPreferenceState(pref);
        nativewindColorScheme.set(pref);
      })
      .catch((err) => {
        console.warn("[ThemeProvider] failed to load saved theme, defaulting to system", err);
      })
      .finally(() => setHydrated(true));
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    nativewindColorScheme.set(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref).catch((err) =>
      console.warn("[ThemeProvider] failed to persist theme preference", err)
    );
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      colorScheme: colorScheme ?? "light",
      setPreference,
      isDark: colorScheme === "dark",
    }),
    [preference, colorScheme]
  );

  // Avoid a light->dark flash: render nothing for the brief moment it takes
  // to read AsyncStorage (this resolves near-instantly in practice).
  if (!hydrated) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
