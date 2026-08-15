import React, { useEffect, useState } from "react";
import Text from "../components/AccessibleText";
import { Pressable, View } from "react-native";
import TabScreenScroll from "../components/TabScreenScroll";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Clock, Hand, ListOrdered, Mic, Sparkles, TrendingUp } from "lucide-react-native";
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
    descriptionKey: "game_spot_ai_lie_desc" as TranslationKey,
    icon: Mic,
    accentHex: "#d97706",
    iconBg: "bg-amber-100",
  },
  {
    id: "era-guesser" as const,
    screen: "EraGuesser" as const,
    titleKey: "game_era_guesser" as TranslationKey,
    descriptionKey: "game_era_guesser_desc" as TranslationKey,
    icon: Clock,
    accentHex: "#2563eb",
    iconBg: "bg-blue-100",
  },
  {
    id: "recipe-rebuilder" as const,
    screen: "RecipeRebuilder" as const,
    titleKey: "game_recipe_rebuilder" as TranslationKey,
    descriptionKey: "game_recipe_rebuilder_desc" as TranslationKey,
    icon: ListOrdered,
    accentHex: "#059669",
    iconBg: "bg-emerald-100",
  },
  {
    id: "motion-match" as const,
    screen: "MotionMatch" as const,
    titleKey: "game_motion_match" as TranslationKey,
    descriptionKey: "game_motion_match_desc" as TranslationKey,
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
        <Text accessibilityRole="header" className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
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

        <View className="mt-3 flex-row items-start gap-2.5 rounded-2xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
          <Sparkles size={16} color="#0d9488" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
              {t("hub_ai_insight_label")}
            </Text>
            <Text className="mt-0.5 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
              {analytics.aiRecommendation}
            </Text>
          </View>
        </View>
      </View>

      {/* A single-column list is easier to scan than a dense grid and leaves
          enough room to explain each activity before the user opens it. */}
      <View className="gap-3">
        <Text accessibilityRole="header" className="text-2xl font-extrabold text-zinc-950 dark:text-white">
          {t("hub_choose_activity")}
        </Text>
        <Text className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
          {t("hub_choose_activity_hint")}
        </Text>
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Pressable
              key={game.id}
              onPress={() => navigation.navigate(game.screen)}
              accessibilityRole="button"
              accessibilityLabel={`${t(game.titleKey)}. ${t(game.descriptionKey)}. ${t("hub_start_game")}`}
              accessibilityHint={t("hub_start_game")}
              className="min-h-32 flex-row items-center gap-4 rounded-3xl border-2 border-zinc-200 bg-white p-5 shadow-sm active:bg-teal-50 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <View className={`rounded-3xl p-4 ${game.iconBg}`}>
                <Icon size={38} color={game.accentHex} />
              </View>
              <View className="flex-1 gap-1.5">
                <Text className="text-xl font-extrabold text-zinc-950 dark:text-white">
                  {t(game.titleKey)}
                </Text>
                <Text className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {t(game.descriptionKey)}
                </Text>
                <Text className="mt-1 text-base font-bold text-teal-700 dark:text-teal-300">
                  {t("hub_start_game")}  →
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </TabScreenScroll>
  );
}
