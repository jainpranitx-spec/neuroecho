import React, { useState } from "react";
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

export default function AiAssistantModal() {
  const { isOpen, close } = useAiModal();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ answer: string; sources: string[] } | null>(null);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const data = await api.askAi(query);
      setResponse(data);
    } catch {
      setResponse({
        answer:
          "NeuroEcho AI is ready! Play games like Spot the AI Lie or Recipe Rebuilder to sharpen memory and sequencing.",
        sources: ["NeuroEcho Help"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={close}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[85%] rounded-t-3xl bg-white p-6">
          <View className="flex-row items-center justify-between border-b border-zinc-200 pb-4">
            <View className="flex-row items-center gap-2.5">
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-teal-600">
                <Sparkles size={16} color="white" />
              </View>
              <View>
                <Text className="text-lg font-bold text-zinc-900">NeuroEcho AI Assistant</Text>
                <Text className="text-xs text-zinc-400">
                  Ask cognitive questions or request a custom game topic
                </Text>
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
              placeholder="Ask anything, e.g. 'How to improve my focus?'"
              placeholderTextColor="#a1a1aa"
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-base text-zinc-900"
              onSubmitEditing={handleAsk}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleAsk}
              disabled={loading}
              className="rounded-xl bg-teal-600 px-5 py-4 disabled:opacity-50"
            >
              <Text className="text-sm font-semibold text-white">
                {loading ? "Thinking..." : "Ask AI"}
              </Text>
            </Pressable>
          </View>

          {loading && (
            <View className="mt-6 items-center py-6">
              <ActivityIndicator color="#0d9488" />
            </View>
          )}

          {response && (
            <ScrollView className="mt-6 max-h-96 rounded-2xl border border-teal-200/60 bg-teal-50/50 p-5">
              <View className="mb-2 flex-row items-center gap-2">
                <Brain size={16} color="#0f766e" />
                <Text className="text-xs font-bold uppercase tracking-wide text-teal-700">
                  NeuroEcho Cognitive Answer
                </Text>
              </View>
              <Text className="text-base leading-relaxed text-zinc-800">{response.answer}</Text>
              {response.sources.length > 0 && (
                <View className="mt-3 flex-row flex-wrap gap-2 border-t border-teal-200/40 pt-3">
                  {response.sources.map((s, idx) => (
                    <View
                      key={idx}
                      className="rounded border border-teal-200 bg-white px-2 py-0.5"
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
