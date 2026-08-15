import React, { useEffect, useMemo, useState } from "react";
import Markdown from "react-native-markdown-display";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Brain, Sparkles, X } from "lucide-react-native";
import { useAiModal } from "../context/AiModalContext";
import { api } from "../lib/api";
import { useAsyncGuard } from "../lib/useAsyncGuard";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export default function AiAssistantModal() {
  const { isOpen, close } = useAiModal();
  const { isDark } = useTheme();
  const { language, t } = useLanguage();
  const markdownStyles = useMemo(() => createMarkdownStyles(isDark), [isDark]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ answer: string; sources: string[] } | null>(null);
  const askGuard = useAsyncGuard();

  // A previous answer stays in whatever language it was generated in —
  // clear it on language switch so stale-language text can't linger.
  useEffect(() => {
    setResponse(null);
  }, [language]);

  const handleAsk = () =>
    askGuard.runGuarded(async () => {
      if (!query.trim()) return;
      setLoading(true);
      setResponse(null);
      try {
        const data = await api.askAi(query, language);
        setResponse(data);
      } catch (err) {
        console.warn("[AiAssistantModal] askAi failed", err);
        setResponse({
          answer:
            "NeuroEcho AI is ready! Play games like Spot the AI Lie or Recipe Rebuilder to sharpen memory and sequencing.",
          sources: ["NeuroEcho Help"],
        });
      } finally {
        setLoading(false);
      }
    });

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={close}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[85%] rounded-t-3xl bg-white p-6 dark:bg-zinc-900">
          <View className="flex-row items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
            <View className="flex-row items-center gap-2.5">
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-teal-600">
                <Sparkles size={16} color="white" />
              </View>
              <View>
                <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{t("assistant_title")}</Text>
                <Text className="text-xs text-zinc-400">{t("assistant_subtitle")}</Text>
              </View>
            </View>
            <Pressable
              onPress={close}
              hitSlop={12}
              className="rounded-xl p-2"
              accessibilityLabel="Close AI assistant"
            >
              <X size={20} color="#71717a" />
            </Pressable>
          </View>

          <View className="mt-4 flex-row items-center gap-3">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("assistant_placeholder")}
              placeholderTextColor="#a1a1aa"
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              onSubmitEditing={handleAsk}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleAsk}
              disabled={loading}
              className="rounded-xl bg-teal-600 px-5 py-4 disabled:opacity-50"
            >
              <Text className="text-sm font-semibold text-white">
                {loading ? t("assistant_thinking") : t("assistant_ask")}
              </Text>
            </Pressable>
          </View>

          {loading && (
            <View className="mt-6 items-center py-6">
              <ActivityIndicator color="#0d9488" />
            </View>
          )}

          {response && (
            <ScrollView className="mt-6 max-h-96 rounded-2xl border border-teal-200/60 bg-teal-50/50 p-5 dark:border-teal-900/60 dark:bg-teal-950/30">
              <View className="mb-2 flex-row items-center gap-2">
                <Brain size={16} color="#0f766e" />
                <Text className="text-xs font-bold uppercase tracking-wide text-teal-700">
                  {t("assistant_answer_heading")}
                </Text>
              </View>
              
              <Markdown style={markdownStyles}>
                {response.answer}
              </Markdown>

              {response.sources.length > 0 && (
                <View className="mt-3 flex-row flex-wrap gap-2 border-t border-teal-200/40 pt-3">
                  {response.sources.map((s, idx) => (
                    <View
                      key={idx}
                      className="rounded border border-teal-200 bg-white px-2 py-0.5 dark:border-teal-800 dark:bg-zinc-900"
                    >
                      <Text className="text-xs text-teal-700">{s}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function createMarkdownStyles(isDark: boolean) {
  return {
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: isDark ? "#e4e4e7" : "#27272a",
    },
    heading1: {
      fontSize: 18,
      fontWeight: "bold" as const,
      marginVertical: 6,
      color: isDark ? "#2dd4bf" : "#0f766e",
    },
    heading2: {
      fontSize: 16,
      fontWeight: "bold" as const,
      marginVertical: 4,
      color: isDark ? "#f4f4f5" : "#111827",
    },
    bullet_list: {
      marginVertical: 4,
    },
    list_item: {
      marginVertical: 2,
    },
    strong: {
      fontWeight: "bold" as const,
      color: isDark ? "#f4f4f5" : "#18181b",
    },
  };
}