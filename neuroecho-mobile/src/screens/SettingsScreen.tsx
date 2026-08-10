import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { CheckCircle2, Save, ShieldCheck, Sliders, Volume2 } from "lucide-react-native";
import { speakFeedback } from "../lib/speech";
import { api } from "../lib/api";
import { UserProfile } from "../lib/types";

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

const SPEECH_RATES = [
  { rate: "0.75", label: "Slow & Clear (0.75x)", desc: "Maximum auditory clarity" },
  { rate: "0.85", label: "Gentle Pace (0.85x)", desc: "Recommended senior default" },
  { rate: "1.0", label: "Standard Pace (1.0x)", desc: "Regular conversation speed" },
];

const DIFFICULTIES = [
  { level: "gentle", label: "Gentle Zen", desc: "Longer pauses & simpler questions" },
  { level: "standard", label: "Standard Mind", desc: "Balanced cognitive exercise" },
  { level: "challenge", label: "Master Mind", desc: "Faster pace & subtle inaccuracies" },
];

export default function SettingsScreen() {
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
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await api.updateProfile(profile);
      setSavedSuccess(true);
      speakFeedback("Zen accessibility settings updated successfully.");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // keep local state even if save fails
    }
  };

  return (
    <ScrollView className="flex-1 bg-zinc-50" contentContainerStyle={{ padding: 16, gap: 24 }}>
      <View>
        <Text className="text-2xl font-extrabold text-zinc-900">
          Zen Settings & Tremor Adaptation
        </Text>
        <Text className="mt-1 text-sm text-zinc-500">
          Customize voice rate, tremor tolerance, and game difficulty.
        </Text>
      </View>

      <View className="gap-6 rounded-3xl border border-zinc-200 bg-white p-6">
        {/* Tremor assist */}
        <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <View className="flex-1 flex-row items-start gap-3">
            <View className="mt-0.5 rounded-2xl bg-teal-600 p-2.5">
              <ShieldCheck size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-zinc-900">
                Tremor-Proof Target Guard
              </Text>
              <Text className="text-xs text-zinc-500">
                Keeps large tap targets and prevents accidental double-taps.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setProfile((p) => ({ ...p, tremorAssist: !p.tremorAssist }))}
            className={`rounded-2xl px-4 py-2.5 ${
              profile.tremorAssist ? "bg-teal-600" : "bg-zinc-200"
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                profile.tremorAssist ? "text-white" : "text-zinc-700"
              }`}
            >
              {profile.tremorAssist ? "Active" : "Disabled"}
            </Text>
          </Pressable>
        </View>

        {/* Speech rate */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Volume2 size={18} color="#0d9488" />
            <Text className="text-sm font-bold text-zinc-900">Voice Synthesis Pace</Text>
          </View>
          <View className="gap-2">
            {SPEECH_RATES.map((item) => (
              <Pressable
                key={item.rate}
                onPress={() => setProfile((p) => ({ ...p, speechRate: item.rate }))}
                className={`rounded-2xl border p-4 ${
                  profile.speechRate === item.rate
                    ? "border-teal-600 bg-teal-600"
                    : "border-zinc-200 bg-zinc-50"
                }`}
              >
                <Text
                  className={`text-base font-bold ${
                    profile.speechRate === item.rate ? "text-white" : "text-zinc-800"
                  }`}
                >
                  {item.label}
                </Text>
                <Text
                  className={`mt-0.5 text-xs ${
                    profile.speechRate === item.rate ? "text-teal-100" : "text-zinc-400"
                  }`}
                >
                  {item.desc}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Difficulty */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Sliders size={18} color="#0d9488" />
            <Text className="text-sm font-bold text-zinc-900">Cognitive Difficulty Level</Text>
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
                    : "border-zinc-200 bg-zinc-50"
                }`}
              >
                <Text
                  className={`text-base font-bold ${
                    profile.difficultyLevel === item.level ? "text-white" : "text-zinc-800"
                  }`}
                >
                  {item.label}
                </Text>
                <Text
                  className={`mt-0.5 text-xs ${
                    profile.difficultyLevel === item.level ? "text-teal-100" : "text-zinc-400"
                  }`}
                >
                  {item.desc}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="flex-row items-center justify-between border-t border-zinc-200 pt-4">
          {savedSuccess ? (
            <View className="flex-row items-center gap-1.5">
              <CheckCircle2 size={18} color="#059669" />
              <Text className="text-sm font-bold text-emerald-600">Settings Saved!</Text>
            </View>
          ) : (
            <Text className="text-xs text-zinc-400">Changes apply across all arcade games.</Text>
          )}
          <Pressable
            onPress={handleSave}
            className="flex-row items-center gap-2.5 rounded-2xl bg-teal-600 px-6 py-3.5"
          >
            <Save size={18} color="white" />
            <Text className="text-base font-bold text-white">Save</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
