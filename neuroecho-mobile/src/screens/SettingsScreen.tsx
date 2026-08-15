import React, { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import TabScreenScroll from "../components/TabScreenScroll";
import { CheckCircle2, Globe, Moon, PhoneCall, Save, ShieldCheck, Sliders, Smartphone, Sun, Volume2 } from "lucide-react-native";
import { speakFeedback } from "../lib/speech";
import { api } from "../lib/api";
import { UserProfile } from "../lib/types";
import { ThemePreference, useTheme } from "../context/ThemeContext";
import { useAudioOutput } from "../context/AudioOutputContext";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES, TranslationKey } from "../lib/i18n";

type SettingsProfile = Pick<
  UserProfile,
  | "name"
  | "age"
  | "difficultyLevel"
  | "speechRate"
  | "tremorAssist"
  | "highContrast"
  | "voiceFeedbackEnabled"
>;

const SPEECH_RATES: { rate: string; labelKey: TranslationKey; descKey: TranslationKey }[] = [
  { rate: "0.75", labelKey: "speech_rate_075_label", descKey: "speech_rate_075_desc" },
  { rate: "0.85", labelKey: "speech_rate_085_label", descKey: "speech_rate_085_desc" },
  { rate: "1.0", labelKey: "speech_rate_1_label", descKey: "speech_rate_1_desc" },
];

const DIFFICULTIES: { level: string; labelKey: TranslationKey; descKey: TranslationKey }[] = [
  { level: "gentle", labelKey: "difficulty_gentle_label", descKey: "difficulty_gentle_desc" },
  { level: "standard", labelKey: "difficulty_standard_label", descKey: "difficulty_standard_desc" },
  { level: "challenge", labelKey: "difficulty_challenge_label", descKey: "difficulty_challenge_desc" },
];

const THEME_OPTIONS: { pref: ThemePreference; labelKey: TranslationKey; icon: typeof Sun }[] = [
  { pref: "light", labelKey: "settings_theme_light", icon: Sun },
  { pref: "dark", labelKey: "settings_theme_dark", icon: Moon },
  { pref: "system", labelKey: "settings_theme_system", icon: Smartphone },
];

export default function SettingsScreen() {
  const { preference, setPreference } = useTheme();
  const { output, setOutput } = useAudioOutput();
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<SettingsProfile>({
    name: "Senior Explorer",
    age: 72,
    difficultyLevel: "standard",
    speechRate: "0.85",
    tremorAssist: true,
    highContrast: false,
    voiceFeedbackEnabled: true,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api
      .getProfile()
      .then((data) => {
        if (data?.name) setProfile(data as typeof profile);
      })
      .catch((e) => console.warn("[SettingsScreen] request failed", e));
  }, []);

  const handleSave = async () => {
    try {
      await api.updateProfile(profile);
      setSavedSuccess(true);
      speakFeedback(t("settings_saved"));
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn("[SettingsScreen] save failed", err);
    }
  };

  return (
    <TabScreenScroll className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View>
        <Text className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {t("settings_title")}
        </Text>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("settings_subtitle")}
        </Text>
      </View>

      <View className="gap-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Language */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Globe size={18} color="#0d9488" />
            <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t("settings_language")}</Text>
          </View>
          <View className="flex-row gap-2">
            {LANGUAGES.map((opt) => {
              const active = language === opt.code;
              return (
                <Pressable
                  key={opt.code}
                  onPress={() => setLanguage(opt.code)}
                  className={`flex-1 items-center gap-1.5 rounded-2xl border p-3 ${
                    active
                      ? "border-teal-600 bg-teal-600"
                      : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      active ? "text-white" : "text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {opt.nativeLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Appearance */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Moon size={18} color="#0d9488" />
            <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t("settings_appearance")}</Text>
          </View>
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = preference === opt.pref;
              return (
                <Pressable
                  key={opt.pref}
                  onPress={() => setPreference(opt.pref)}
                  className={`flex-1 items-center gap-1.5 rounded-2xl border p-3 ${
                    active
                      ? "border-teal-600 bg-teal-600"
                      : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                  }`}
                >
                  <Icon size={18} color={active ? "white" : "#71717a"} />
                  <Text
                    className={`text-xs font-bold ${
                      active ? "text-white" : "text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Tremor assist */}
        <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <View className="flex-1 flex-row items-start gap-3">
            <View className="mt-0.5 rounded-2xl bg-teal-600 p-2.5">
              <ShieldCheck size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {t("settings_tremor_title")}
              </Text>
              <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("settings_tremor_desc")}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setProfile((p) => ({ ...p, tremorAssist: !p.tremorAssist }))}
            className={`rounded-2xl px-4 py-2.5 ${
              profile.tremorAssist ? "bg-teal-600" : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                profile.tremorAssist ? "text-white" : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {profile.tremorAssist ? t("settings_tremor_active") : t("settings_tremor_disabled")}
            </Text>
          </Pressable>
        </View>

        {/* Speech rate */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Volume2 size={18} color="#0d9488" />
            <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t("settings_voice_pace")}
            </Text>
          </View>
          <View className="gap-2">
            {SPEECH_RATES.map((item) => (
              <Pressable
                key={item.rate}
                onPress={() => setProfile((p) => ({ ...p, speechRate: item.rate }))}
                className={`rounded-2xl border p-4 ${
                  profile.speechRate === item.rate
                    ? "border-teal-600 bg-teal-600"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                }`}
              >
                <Text
                  className={`text-base font-bold ${
                    profile.speechRate === item.rate
                      ? "text-white"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {t(item.labelKey)}
                </Text>
                <Text
                  className={`mt-0.5 text-xs ${
                    profile.speechRate === item.rate ? "text-teal-100" : "text-zinc-400"
                  }`}
                >
                  {t(item.descKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Voice output */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Volume2 size={18} color="#0d9488" />
            <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t("settings_voice_output")}</Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setOutput("loudspeaker")}
              className={`flex-1 items-center gap-1.5 rounded-2xl border p-3 ${
                output === "loudspeaker"
                  ? "border-teal-600 bg-teal-600"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
              }`}
            >
              <Volume2 size={18} color={output === "loudspeaker" ? "white" : "#71717a"} />
              <Text
                className={`text-xs font-bold ${
                  output === "loudspeaker" ? "text-white" : "text-zinc-600 dark:text-zinc-300"
                }`}
              >
                {t("settings_voice_output_loudspeaker")}
              </Text>
            </Pressable>
            {Platform.OS === "android" && (
              <Pressable
                onPress={() => setOutput("earpiece")}
                className={`flex-1 items-center gap-1.5 rounded-2xl border p-3 ${
                  output === "earpiece"
                    ? "border-teal-600 bg-teal-600"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                }`}
              >
                <PhoneCall size={18} color={output === "earpiece" ? "white" : "#71717a"} />
                <Text
                  className={`text-xs font-bold ${
                    output === "earpiece" ? "text-white" : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {t("settings_voice_output_earpiece")}
                </Text>
              </Pressable>
            )}
          </View>
          {Platform.OS === "ios" && (
            <Text className="text-xs text-zinc-400">{t("settings_voice_output_ios_note")}</Text>
          )}
        </View>

        {/* Difficulty */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Sliders size={18} color="#0d9488" />
            <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t("settings_difficulty")}
            </Text>
          </View>
          <View className="gap-2">
            {DIFFICULTIES.map((item) => (
              <Pressable
                key={item.level}
                onPress={() =>
                  setProfile((p) => ({
                    ...p,
                    difficultyLevel: item.level as typeof p.difficultyLevel,
                  }))
                }
                className={`rounded-2xl border p-4 ${
                  profile.difficultyLevel === item.level
                    ? "border-teal-600 bg-teal-600"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                }`}
              >
                <Text
                  className={`text-base font-bold ${
                    profile.difficultyLevel === item.level
                      ? "text-white"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {t(item.labelKey)}
                </Text>
                <Text
                  className={`mt-0.5 text-xs ${
                    profile.difficultyLevel === item.level ? "text-teal-100" : "text-zinc-400"
                  }`}
                >
                  {t(item.descKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="flex-row items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {savedSuccess ? (
            <View className="flex-row items-center gap-1.5">
              <CheckCircle2 size={18} color="#059669" />
              <Text className="text-sm font-bold text-emerald-600">{t("settings_saved")}</Text>
            </View>
          ) : (
            <Text className="text-xs text-zinc-400">{t("settings_save_hint")}</Text>
          )}
          <Pressable
            onPress={handleSave}
            className="flex-row items-center gap-2.5 rounded-2xl bg-teal-600 px-6 py-3.5"
          >
            <Save size={18} color="white" />
            <Text className="text-base font-bold text-white">{t("settings_save")}</Text>
          </Pressable>
        </View>
      </View>
    </TabScreenScroll>
  );
}
