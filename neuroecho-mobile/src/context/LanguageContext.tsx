import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppLanguage, LANGUAGES, TranslationKey, translate } from "../lib/i18n";
import { setSpeechLanguage } from "../lib/speech";

const STORAGE_KEY = "neuroecho.language";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        const lang = (stored as AppLanguage | null) ?? "en";
        setLanguageState(lang);
        const speechLocale = LANGUAGES.find((l) => l.code === lang)?.speechLocale ?? "en-US";
        setSpeechLanguage(speechLocale);
      })
      .catch((err) => console.warn("[LanguageProvider] failed to load saved language", err))
      .finally(() => setHydrated(true));
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    const speechLocale = LANGUAGES.find((l) => l.code === lang)?.speechLocale ?? "en-US";
    setSpeechLanguage(speechLocale);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch((err) =>
      console.warn("[LanguageProvider] failed to persist language", err)
    );
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translate(language, key),
    }),
    [language]
  );

  if (!hydrated) return null;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
