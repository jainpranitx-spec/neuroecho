import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ArrowRight,
  Brain,
  Clock,
  Hand,
  ListOrdered,
  Mic,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import { RootStackParamList } from "../navigation/types";
import { api, AnalyticsResponse } from "../lib/api";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_ANALYTICS: Pick<
  AnalyticsResponse,
  "overallIndex" | "scores" | "aiRecommendation"
> = {
  overallIndex: 88,
  scores: {
    memoryAudit: 88,
    visualRecognition: 92,
    logicalSequencing: 85,
    motorCoordination: 90,
  },
  aiRecommendation:
    "Great cognitive stability! Today is an optimal day for Dual-Task Motor training to enhance focus and coordination.",
};

const GAMES = [
  {
    id: "spot-ai-lie" as const,
    screen: "SpotAiLie" as const,
    title: "1. Spot the AI Lie",
    subtitle: "Memory Auditor",
    description:
      "Listen to nostalgic short stories read aloud. Press the giant tremor-proof buzzer the second you hear an AI mistake!",
    icon: Mic,
    accentHex: "#d97706",
    iconBg: "bg-amber-100",
    badge: "Auditory Recall",
    scoreKey: "memoryAudit" as const,
    buttonText: "Launch Memory Auditor",
  },
  {
    id: "era-guesser" as const,
    screen: "EraGuesser" as const,
    title: "2. Era Guesser",
    subtitle: "Visual Semantic Memory",
    description:
      "Examine detailed retro historical scenes. Identify the anachronistic item that doesn't belong in that decade.",
    icon: Clock,
    accentHex: "#2563eb",
    iconBg: "bg-blue-100",
    badge: "Visual Recognition",
    scoreKey: "visualRecognition" as const,
    buttonText: "Launch Era Guesser",
  },
  {
    id: "recipe-rebuilder" as const,
    screen: "RecipeRebuilder" as const,
    title: "3. Recipe Rebuilder",
    subtitle: "Logical Sequencing",
    description:
      "Scrambled classic baking & soup recipes created by AI. Tap the up/down arrows to restore the correct cooking sequence.",
    icon: ListOrdered,
    accentHex: "#059669",
    iconBg: "bg-emerald-100",
    badge: "Executive Function",
    scoreKey: "logicalSequencing" as const,
    buttonText: "Launch Recipe Rebuilder",
  },
  {
    id: "motion-match" as const,
    screen: "MotionMatch" as const,
    title: "4. Motion Match",
    subtitle: "Dual-Task Training",
    description:
      "Interactive dual-task prompts: Fruit = tap Left, Machine = tap Right. A live camera preview keeps you engaged.",
    icon: Hand,
    accentHex: "#0d9488",
    iconBg: "bg-teal-100",
    badge: "Motor Coordination",
    scoreKey: "motorCoordination" as const,
    buttonText: "Launch Motion Stage",
  },
];

export default function HubScreen() {
  const navigation = useNavigation<Nav>();
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);

  useEffect(() => {
    api
      .getAnalytics()
      .then((data) => {
        if (data?.scores) setAnalytics(data);
      })
      .catch(() => {});
  }, []);

  return (
    <ScrollView className="flex-1 bg-zinc-50" contentContainerStyle={{ padding: 16, gap: 24 }}>
      {/* Hero */}
      <View className="rounded-3xl border border-zinc-200 bg-white p-6">
        <View className="flex-row items-center gap-2 self-start rounded-full border border-teal-200 bg-teal-50 px-3 py-1">
          <Sparkles size={14} color="#0f766e" />
          <Text className="text-xs font-semibold text-teal-700">
            Cognitive Health Hub • Daily Session
          </Text>
        </View>

        <Text className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900">
          Welcome to NeuroEcho
        </Text>
        <Text className="mt-2 text-base leading-relaxed text-zinc-600">
          Personalized, calming cognitive workouts designed specifically for seniors. Choose a
          game below or follow today&apos;s AI recommendation.
        </Text>

        <View className="mt-4 flex-row items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <View className="mt-0.5 shrink-0 rounded-xl bg-teal-600 p-2">
            <Brain size={18} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-teal-700">
              AI Cognitive Insight Today
            </Text>
            <Text className="mt-1 text-sm font-medium text-zinc-800">
              {analytics.aiRecommendation}
            </Text>
          </View>
        </View>
      </View>

      {/* Score cards */}
      <View className="flex-row flex-wrap gap-3">
        <ScoreCard
          label="Cognitive Index"
          value={`${analytics.overallIndex}`}
          suffix="/100"
          color="text-teal-600"
          footer="Optimal Mind Agility"
          icon={<TrendingUp size={12} color="#059669" />}
        />
        <ScoreCard
          label="Auditory Recall"
          value={`${analytics.scores.memoryAudit}%`}
          color="text-amber-600"
          footer="Spot the AI Lie"
        />
        <ScoreCard
          label="Visual Memory"
          value={`${analytics.scores.visualRecognition}%`}
          color="text-blue-600"
          footer="Era Guesser"
        />
        <ScoreCard
          label="Motor Agility"
          value={`${analytics.scores.motorCoordination}%`}
          color="text-teal-600"
          footer="Motion Match"
        />
      </View>

      {/* Games */}
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-zinc-900">Cognitive Arcade Games</Text>
          <View className="rounded-full bg-zinc-100 px-3 py-1">
            <Text className="text-xs font-semibold text-zinc-600">4 Games Active</Text>
          </View>
        </View>

        {GAMES.map((game) => {
          const Icon = game.icon;
          const score = analytics.scores[game.scoreKey];
          return (
            <View
              key={game.id}
              className="gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 flex-row items-center gap-3">
                  <View className={`rounded-2xl p-3 ${game.iconBg}`}>
                    <Icon size={26} color={game.accentHex} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {game.badge}
                    </Text>
                    <Text className="text-lg font-bold text-zinc-900">{game.title}</Text>
                  </View>
                </View>
                <View className="shrink-0 rounded-xl bg-zinc-100 px-2.5 py-1">
                  <Text className="text-xs font-extrabold text-zinc-700">Score: {score}%</Text>
                </View>
              </View>

              <Text className="text-base leading-relaxed text-zinc-600">{game.description}</Text>

              <Pressable
                onPress={() => navigation.navigate(game.screen)}
                className="tremor-button flex-row items-center justify-center gap-3 rounded-2xl bg-teal-600 px-6 py-4 active:bg-teal-700"
              >
                <Text className="text-lg font-bold text-white">{game.buttonText}</Text>
                <ArrowRight size={20} color="white" />
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Tips */}
      <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-100/60 p-5">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="rounded-xl bg-teal-600 p-2.5">
            <Zap size={18} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-zinc-900">Accessibility Notice</Text>
            <Text className="text-xs text-zinc-500">
              All buttons use large tap targets for tremor tolerance. Voice feedback can be
              adjusted in Settings.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function ScoreCard({
  label,
  value,
  suffix,
  color,
  footer,
  icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  color: string;
  footer: string;
  icon?: React.ReactNode;
}) {
  return (
    <View className="min-w-[46%] flex-1 justify-between rounded-2xl border border-zinc-200 bg-white p-4">
      <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</Text>
      <View className="mt-2 flex-row items-baseline gap-1">
        <Text className={`text-3xl font-extrabold ${color}`}>{value}</Text>
        {suffix && <Text className="text-lg text-zinc-400">{suffix}</Text>}
      </View>
      <View className="mt-1 flex-row items-center gap-1">
        {icon}
        <Text className="text-xs font-medium text-zinc-400">{footer}</Text>
      </View>
    </View>
  );
}
