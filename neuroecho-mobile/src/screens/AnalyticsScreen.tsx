import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Brain, TrendingUp } from "lucide-react-native";
import { api, AnalyticsResponse } from "../lib/api";

const DEFAULT_DATA: AnalyticsResponse = {
  overallIndex: 88,
  scores: {
    memoryAudit: 88,
    visualRecognition: 92,
    logicalSequencing: 85,
    motorCoordination: 90,
  },
  totalSessionsCompleted: 14,
  aiRecommendation:
    "Excellent cognitive stamina! Your auditory recall and spatial sequencing show continuous improvement over the last 7 days.",
  recentSessions: [],
};

const DOMAINS = [
  { key: "memoryAudit" as const, label: "1. Spot the AI Lie (Auditory Memory)", color: "#d97706", bg: "bg-amber-500" },
  { key: "visualRecognition" as const, label: "2. Era Guesser (Visual Semantic)", color: "#2563eb", bg: "bg-blue-500" },
  { key: "logicalSequencing" as const, label: "3. Recipe Rebuilder (Executive Sequencing)", color: "#059669", bg: "bg-emerald-500" },
  { key: "motorCoordination" as const, label: "4. Motion Match (Dual-Task Motor)", color: "#0d9488", bg: "bg-teal-600" },
];

export default function AnalyticsScreen() {
  const [data, setData] = useState<AnalyticsResponse>(DEFAULT_DATA);

  useEffect(() => {
    api
      .getAnalytics()
      .then((d) => {
        if (d?.scores) setData(d);
      })
      .catch(() => {});
  }, []);

  return (
    <ScrollView className="flex-1 bg-zinc-50" contentContainerStyle={{ padding: 16, gap: 20 }}>
      <View className="border-b border-zinc-200 pb-4">
        <View className="self-start rounded-full border border-teal-200 bg-teal-50 px-3 py-1">
          <Text className="text-xs font-bold text-teal-600">
            Cognitive Report • Doctor & Caregiver View
          </Text>
        </View>
        <Text className="mt-2 text-2xl font-extrabold text-zinc-900">
          Cognitive Analytics & Progress
        </Text>
        <Text className="mt-1 text-sm text-zinc-500">
          Breakdown of memory recall, visual processing, sequencing, and motor control.
        </Text>
      </View>

      <View className="gap-6 rounded-3xl border border-zinc-200 bg-white p-6">
        <View className="gap-4 border-b border-zinc-200 pb-6">
          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Overall NeuroEcho Index
            </Text>
            <View className="mt-1 flex-row items-baseline gap-2">
              <Text className="text-5xl font-extrabold text-zinc-900">{data.overallIndex}</Text>
              <Text className="text-xl font-semibold text-zinc-400">/ 100</Text>
            </View>
            <View className="mt-1 flex-row items-center gap-1.5">
              <TrendingUp size={16} color="#059669" />
              <Text className="text-sm font-medium text-emerald-600">
                Top 12% for active cognitive stability in age bracket
              </Text>
            </View>
          </View>

          <View className="gap-2 rounded-2xl border border-teal-200 bg-teal-50 p-4">
            <View className="flex-row items-center gap-2">
              <Brain size={16} color="#0f766e" />
              <Text className="text-xs font-bold uppercase text-teal-700">AI Neural Summary</Text>
            </View>
            <Text className="text-sm leading-relaxed text-zinc-800">
              {data.aiRecommendation}
            </Text>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Cognitive Domain Breakdown
          </Text>
          <View className="gap-3">
            {DOMAINS.map((d) => {
              const val = data.scores[d.key];
              return (
                <View key={d.key}>
                  <View className="mb-1 flex-row justify-between">
                    <Text className="flex-1 text-sm font-semibold text-zinc-800">{d.label}</Text>
                    <Text className="text-sm font-extrabold" style={{ color: d.color }}>
                      {val}%
                    </Text>
                  </View>
                  <View className="h-3 overflow-hidden rounded-full bg-zinc-100">
                    <View className={`h-full rounded-full ${d.bg}`} style={{ width: `${val}%` }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="border-t border-zinc-200 pt-4">
          <Text className="text-xs text-zinc-400">
            {data.totalSessionsCompleted} sessions completed total
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
