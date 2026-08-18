import React, { useCallback, useEffect, useRef, useState } from "react";
import Text from "../components/AccessibleText";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send, MessageCircle } from "lucide-react-native";
import { api, FeedbackMessage } from "../lib/api";
import { getDeviceId } from "../lib/deviceId";
import { useLanguage } from "../context/LanguageContext";
import { useAsyncGuard } from "../lib/useAsyncGuard";

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sendGuard = useAsyncGuard();
  const scrollRef = useRef<ScrollView>(null);

  const loadMessages = useCallback(async (id: string) => {
    try {
      const { messages: fetched } = await api.getFeedback(id);
      setMessages(fetched);
    } catch (err) {
      console.warn("[FeedbackScreen] failed to load messages", err);
    }
  }, []);

  useEffect(() => {
    getDeviceId()
      .then((id) => {
        setDeviceId(id);
        return loadMessages(id);
      })
      .catch((err) => console.warn("[FeedbackScreen] failed to init", err))
      .finally(() => setLoading(false));
  }, [loadMessages]);

  // Re-check for a developer reply whenever the screen regains focus —
  // simple polling substitute for real-time updates, which this app's
  // backend doesn't have infrastructure for.
  useFocusEffect(
    useCallback(() => {
      if (deviceId) loadMessages(deviceId);
    }, [deviceId, loadMessages])
  );

  const handleSend = () =>
    sendGuard.runGuarded(async () => {
      const text = draft.trim();
      if (!text || !deviceId) return;
      setError(null);
      const optimistic: FeedbackMessage = {
        id: `pending-${Date.now()}`,
        deviceId,
        direction: "user_to_dev",
        message: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      setDraft("");
      try {
        await api.sendFeedback(deviceId, text);
        await loadMessages(deviceId);
      } catch (err) {
        console.warn("[FeedbackScreen] send failed", err);
        setError(t("feedback_send_error"));
      }
    });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-50 dark:bg-zinc-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top + 44}
    >
      <View className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <Text className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          {t("feedback_intro")}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0d9488" />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 20, gap: 14, flexGrow: 1 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View className="flex-1 items-center justify-center gap-3 py-10">
              <MessageCircle size={40} color="#a1a1aa" />
              <Text className="max-w-xs text-center text-base text-zinc-500 dark:text-zinc-400">
                {t("feedback_empty")}
              </Text>
            </View>
          )}
          {messages.map((m) => (
            <View
              key={m.id}
              className={`max-w-[85%] rounded-3xl px-5 py-4 ${
                m.direction === "user_to_dev"
                  ? "self-end bg-teal-600"
                  : "self-start border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              {m.direction === "dev_to_user" && (
                <Text className="mb-1 text-xs font-bold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                  {t("feedback_dev_label")}
                </Text>
              )}
              <Text
                className={`text-base leading-relaxed ${
                  m.direction === "user_to_dev" ? "text-white" : "text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {m.message}
              </Text>
            </View>
          ))}
          {error && (
            <View className="max-w-[85%] self-start rounded-3xl border border-rose-300 bg-rose-50 px-5 py-4">
              <Text className="text-base text-rose-700">{error}</Text>
            </View>
          )}
        </ScrollView>
      )}

      <View
        className="flex-row items-end gap-3 border-t border-zinc-200 px-5 pt-4 dark:border-zinc-800"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={1000}
          placeholder={t("feedback_placeholder")}
          placeholderTextColor="#a1a1aa"
          accessibilityLabel={t("feedback_placeholder")}
          className="max-h-32 flex-1 rounded-2xl border-2 border-zinc-300 bg-zinc-50 px-4 py-3 text-base text-zinc-950 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
        <Pressable
          onPress={handleSend}
          disabled={draft.trim().length === 0}
          accessibilityRole="button"
          accessibilityLabel={t("feedback_send")}
          className={`h-14 w-14 items-center justify-center rounded-full bg-teal-700 ${
            draft.trim().length === 0 ? "opacity-40" : ""
          }`}
        >
          <Send size={22} color="white" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
