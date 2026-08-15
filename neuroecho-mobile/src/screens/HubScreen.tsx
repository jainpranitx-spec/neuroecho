import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import TabScreenScroll from "../components/TabScreenScroll";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Clock, Hand, ListOrdered, Mic, TrendingUp } from "lucide-react-native";
import { RootStackParamList } from "../navigation/types";
import { api, AnalyticsResponse } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { TranslationKey } from "../lib/i18n";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_ANALYTICS: Pick<AnalyticsResponse, "overallIndex" | "aiRecommendation"> = {
  overallIndex: 88,
  aiRecommendation:
    "Great cognitive stability! Today is an optimal day for Dual-Task Motor training.",
};

const GAMES = [
  {
    id: "spot-ai-lie" as const,
    screen: "SpotAiLie" as const,
    titleKey: "game_spot_ai_lie" as TranslationKey,
    icon: Mic,
    accentHex: "#d97706",
    iconBg: "bg-amber-100",
  },
  {
    id: "era-guesser" as const,
    screen: "EraGuesser" as const,
    titleKey: "game_era_guesser" as TranslationKey,
    icon: Clock,
    accentHex: "#2563eb",
    iconBg: "bg-blue-100",
  },
  {
    id: "recipe-rebuilder" as const,
    screen: "RecipeRebuilder" as const,
    titleKey: "game_recipe_rebuilder" as TranslationKey,
    icon: ListOrdered,
    accentHex: "#059669",
    iconBg: "bg-emerald-100",
  },
  {
    id: "motion-match" as const,
    screen: "MotionMatch" as const,
    titleKey: "game_motion_match" as TranslationKey,
    icon: Hand,
    accentHex: "#0d9488",
    iconBg: "bg-teal-100",
  },
];

export default function HubScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);

  useEffect(() => {
    api
      .getAnalytics()
      .then((data) => {
        if (data?.overallIndex) setAnalytics(data);
      })
      .catch((e) => console.warn("[HubScreen] request failed", e));
  }, []);

  return (
    <TabScreenScroll className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <View className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <Text className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("hub_welcome")}
        </Text>
        <Text className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t("hub_subtitle")}
        </Text>

        <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-teal-700">
              {t("hub_cognitive_index")}
            </Text>
            <View className="mt-1 flex-row items-baseline gap-1.5">
              <Text className="text-4xl font-extrabold text-teal-700">{analytics.overallIndex}</Text>
              <Text className="text-base text-teal-500">/ 100</Text>
            </View>
          </View>
          <TrendingUp size={32} color="#0f766e" />
        </View>
      </View>

      {/* Games — big, simple tiles. One tap opens the game. */}
      <View className="flex-row flex-wrap gap-4">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Pressable
              key={game.id}
              onPress={() => navigation.navigate(game.screen)}
              className="min-w-[46%] flex-1 items-center gap-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <View className={`rounded-3xl p-5 ${game.iconBg}`}>
                <Icon size={36} color={game.accentHex} />
              </View>
              <Text className="text-center text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {t(game.titleKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </TabScreenScroll>
  );
}
