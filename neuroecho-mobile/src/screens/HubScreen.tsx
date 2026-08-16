import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, TextInput, View, useWindowDimensions } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Clock, Gamepad2, Hand, ListOrdered, Mic, Plus, Sparkles, TrendingUp, X } from "lucide-react-native";
import Text from "../components/AccessibleText";
import TabScreenScroll from "../components/TabScreenScroll";
import { RootStackParamList } from "../navigation/types";
import { api, AnalyticsResponse } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { TranslationKey } from "../lib/i18n";
import { GENERATED_GAMES } from "../lib/generatedGames";
import { getLocalGameRequests, LocalGameRequest, requestNewGame } from "../lib/gameRequests";
import { getLocalGeneratedGames, LocalGeneratedGame } from "../lib/localGeneratedGames";
import { useAccessibility } from "../context/AccessibilityContext";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_ANALYTICS: Pick<AnalyticsResponse, "overallIndex" | "aiRecommendation"> = {
  overallIndex: 88,
  aiRecommendation: "Great cognitive stability! Today is an optimal day for Dual-Task Motor training.",
};

const GAMES = [
  { id: "spot-ai-lie", screen: "SpotAiLie" as const, titleKey: "game_spot_ai_lie" as TranslationKey, descriptionKey: "game_spot_ai_lie_desc" as TranslationKey, icon: Mic, accentHex: "#b45309", iconBg: "bg-amber-100" },
  { id: "era-guesser", screen: "EraGuesser" as const, titleKey: "game_era_guesser" as TranslationKey, descriptionKey: "game_era_guesser_desc" as TranslationKey, icon: Clock, accentHex: "#1d4ed8", iconBg: "bg-blue-100" },
  { id: "recipe-rebuilder", screen: "RecipeRebuilder" as const, titleKey: "game_recipe_rebuilder" as TranslationKey, descriptionKey: "game_recipe_rebuilder_desc" as TranslationKey, icon: ListOrdered, accentHex: "#047857", iconBg: "bg-emerald-100" },
  { id: "motion-match", screen: "MotionMatch" as const, titleKey: "game_motion_match" as TranslationKey, descriptionKey: "game_motion_match_desc" as TranslationKey, icon: Hand, accentHex: "#0f766e", iconBg: "bg-teal-100" },
];

export default function HubScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useLanguage();
  const { width, fontScale } = useWindowDimensions();
  const { textSize, reduceMotion } = useAccessibility();
  const stackCards = width < 370 || fontScale > 1.2 || textSize === "extraLarge";
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
  const [localGames, setLocalGames] = useState<LocalGeneratedGame[]>([]);
  const [requests, setRequests] = useState<LocalGameRequest[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [gameIdea, setGameIdea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    api.getAnalytics().then((data) => data?.overallIndex && setAnalytics(data)).catch((e) => console.warn("[HubScreen] request failed", e));
  }, []);

  useFocusEffect(useCallback(() => {
    getLocalGameRequests().then(setRequests).catch(() => setRequests([]));
    getLocalGeneratedGames().then(setLocalGames).catch(() => setLocalGames([]));
  }, []));

  const requestedIds = useMemo(() => new Set(requests.map((request) => request.id)), [requests]);
  const availableGeneratedGames = GENERATED_GAMES.filter((game) => requestedIds.has(game.id));
  const pendingRequests = requests.filter((request) => !GENERATED_GAMES.some((game) => game.id === request.id));

  const submitGameRequest = async () => {
    const idea = gameIdea.trim();
    if (idea.length < 3 || submitting) return;
    setSubmitting(true);
    setRequestError(null);
    try {
      const request = await requestNewGame(idea);
      setRequests((current) => [request, ...current]);
      setGameIdea("");
      setRequestSuccess(true);
    } catch (error) {
      console.warn("[HubScreen] game request failed", error);
      setRequestError(t("game_request_error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TabScreenScroll className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="rounded-3xl border-2 border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <Text accessibilityRole="header" className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{t("hub_welcome")}</Text>
        <Text className="mt-2 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{t("hub_subtitle")}</Text>
        <View className="mt-4 flex-row flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-teal-200 bg-teal-50 p-4">
          <View className="min-w-40 flex-1">
            <Text className="text-sm font-bold uppercase tracking-wider text-teal-800">{t("hub_cognitive_index")}</Text>
            <View className="mt-1 flex-row flex-wrap items-baseline gap-1.5">
              <Text className="text-4xl font-extrabold text-teal-800">{analytics.overallIndex}</Text>
              <Text className="text-base text-teal-700">/ 100</Text>
            </View>
          </View>
          <TrendingUp size={34} color="#0f766e" />
        </View>
        <View className="mt-3 flex-row items-start gap-3 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
          <Sparkles size={20} color="#0f766e" style={{ marginTop: 2 }} />
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">{t("hub_ai_insight_label")}</Text>
            <Text className="mt-1 text-base leading-relaxed text-zinc-800 dark:text-zinc-200">{analytics.aiRecommendation}</Text>
          </View>
        </View>
      </View>

      <View className="gap-3">
        <Text accessibilityRole="header" className="text-2xl font-extrabold text-zinc-950 dark:text-white">{t("hub_choose_activity")}</Text>
        <Text className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{t("hub_choose_activity_hint")}</Text>
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Pressable key={game.id} onPress={() => navigation.navigate(game.screen)} accessibilityRole="button" accessibilityLabel={`${t(game.titleKey)}. ${t(game.descriptionKey)}. ${t("hub_start_game")}`} className={`min-h-32 gap-4 rounded-3xl border-2 border-zinc-200 bg-white p-5 active:bg-teal-50 dark:border-zinc-700 dark:bg-zinc-900 ${stackCards ? "items-start" : "flex-row items-center"}`}>
              <View className={`rounded-3xl p-4 ${game.iconBg}`}><Icon size={38} color={game.accentHex} /></View>
              <View className="min-w-0 flex-1 gap-1.5">
                <Text className="text-xl font-extrabold text-zinc-950 dark:text-white">{t(game.titleKey)}</Text>
                <Text className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{t(game.descriptionKey)}</Text>
                <Text className="mt-1 text-base font-bold text-teal-800 dark:text-teal-300">{t("hub_start_game")} →</Text>
              </View>
            </Pressable>
          );
        })}

        {availableGeneratedGames.map((game) => (
          <Pressable key={game.id} onPress={() => navigation.navigate("GeneratedGame", { gameId: game.id, title: game.title })} accessibilityRole="button" className={`min-h-32 gap-4 rounded-3xl border-2 border-violet-300 bg-violet-50 p-5 dark:border-violet-700 dark:bg-violet-950 ${stackCards ? "items-start" : "flex-row items-center"}`}>
            <View className="rounded-3xl bg-violet-200 p-4"><Gamepad2 size={38} color="#6d28d9" /></View>
            <View className="min-w-0 flex-1 gap-1.5">
              <Text className="text-xl font-extrabold text-zinc-950 dark:text-white">{game.title}</Text>
              <Text className="text-base leading-relaxed text-zinc-700 dark:text-zinc-200">{game.description}</Text>
              <Text className="text-base font-bold text-violet-800 dark:text-violet-200">{t("hub_start_game")} →</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {localGames.length > 0 && (
        <View className="gap-3">
          <Text accessibilityRole="header" className="text-2xl font-extrabold text-zinc-950 dark:text-white">{t("hub_your_games")}</Text>
          <Text className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{t("hub_your_games_hint")}</Text>
          {localGames.map((game) => (
            <Pressable
              key={game.id}
              onPress={() => navigation.navigate("GeneratedGame", { gameId: game.id, title: game.title, localDefinition: game })}
              accessibilityRole="button"
              className={`min-h-32 gap-4 rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-950/40 ${stackCards ? "items-start" : "flex-row items-center"}`}
            >
              <View className="rounded-3xl bg-amber-200 p-4 dark:bg-amber-900/60"><Sparkles size={38} color="#b45309" /></View>
              <View className="min-w-0 flex-1 gap-1.5">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl font-extrabold text-zinc-950 dark:text-white">{game.title}</Text>
                  <View className="rounded-full bg-amber-200 px-2.5 py-1 dark:bg-amber-900/60">
                    <Text className="text-xs font-bold text-amber-900 dark:text-amber-200">{t("hub_private_badge")}</Text>
                  </View>
                </View>
                <Text className="text-base leading-relaxed text-zinc-700 dark:text-zinc-200">{game.description}</Text>
                <Text className="text-base font-bold text-amber-800 dark:text-amber-300">{t("hub_start_game")} →</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <View className="gap-4 rounded-3xl border-2 border-dashed border-teal-500 bg-white p-5 dark:bg-zinc-900">
        <View className="flex-row items-start gap-3">
          <View className="rounded-2xl bg-teal-100 p-3"><Plus size={28} color="#0f766e" /></View>
          <View className="min-w-0 flex-1">
            <Text accessibilityRole="header" className="text-xl font-extrabold text-zinc-950 dark:text-white">{t("game_request_title")}</Text>
            <Text className="mt-1 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{t("game_request_desc")}</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={() => { setRequestOpen(true); setRequestSuccess(false); }} className="min-h-16 items-center justify-center rounded-2xl bg-teal-700 px-5">
          <Text className="text-center text-lg font-extrabold text-white">{t("game_request_button")}</Text>
        </Pressable>
        {pendingRequests.length > 0 && <Text className="text-base font-bold text-amber-800 dark:text-amber-300">{t("game_request_pending")} ({pendingRequests.length})</Text>}
      </View>

      <Modal visible={requestOpen} animationType={reduceMotion ? "none" : "slide"} presentationStyle="pageSheet" onRequestClose={() => setRequestOpen(false)}>
        <View className="flex-1 bg-white px-5 pb-8 pt-5 dark:bg-zinc-950">
          <View className="flex-row items-center justify-between gap-3">
            <Text accessibilityRole="header" className="flex-1 text-2xl font-extrabold text-zinc-950 dark:text-white">{t("game_request_title")}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setRequestOpen(false)} className="min-h-12 min-w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800"><X size={24} color="#52525b" /></Pressable>
          </View>
          <Text className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{t("game_request_explanation")}</Text>
          <TextInput value={gameIdea} onChangeText={setGameIdea} multiline maxLength={300} placeholder={t("game_request_placeholder")} placeholderTextColor="#71717a" accessibilityLabel={t("game_request_placeholder")} className="mt-5 min-h-36 rounded-3xl border-2 border-zinc-300 bg-zinc-50 p-5 text-lg text-zinc-950 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white" style={{ textAlignVertical: "top" }} />
          {requestError && <Text accessibilityLiveRegion="assertive" className="mt-3 text-base font-bold text-rose-700">{requestError}</Text>}
          {requestSuccess && <Text accessibilityLiveRegion="polite" className="mt-3 text-base font-bold text-emerald-700">{t("game_request_success")}</Text>}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: submitting || gameIdea.trim().length < 3 }} disabled={submitting || gameIdea.trim().length < 3} onPress={submitGameRequest} className={`mt-5 min-h-16 flex-row items-center justify-center gap-3 rounded-2xl bg-teal-700 px-5 ${submitting || gameIdea.trim().length < 3 ? "opacity-40" : ""}`}>
            {submitting && <ActivityIndicator color="white" />}
            <Text className="text-center text-lg font-extrabold text-white">{submitting ? t("game_request_sending") : t("game_request_submit")}</Text>
          </Pressable>
        </View>
      </Modal>
    </TabScreenScroll>
  );
}
