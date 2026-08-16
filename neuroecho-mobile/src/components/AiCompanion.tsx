import React, { useEffect, useRef, useState } from "react";
import Text from "./AccessibleText";
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mic, Square, X } from "lucide-react-native";
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
} from "expo-audio";
import { File } from "expo-file-system";
import { api, CompanionTurn, slugifyGameId } from "../lib/api";
import { speakFeedback, stopSpeech } from "../lib/speech";
import { navigateToGame, navigateToGeneratedGame, navigateToTab, navigationRef } from "../navigation/navigationRef";
import { useAsyncGuard } from "../lib/useAsyncGuard";
import { setRecordingAudioMode, setPlaybackAudioMode, VOICE_RECORDING_OPTIONS } from "../lib/audioMode";
import { useAudioOutput } from "../context/AudioOutputContext";
import { triggerScreenStart } from "../lib/screenActions";
import { useLanguage } from "../context/LanguageContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { saveLocalGeneratedGame } from "../lib/localGeneratedGames";
import { GeneratedGameDefinition } from "../lib/generatedGames";

const TAB_SCREENS = new Set(["Hub", "Analytics", "Settings"]);

interface DisplayMessage {
  role: "user" | "assistant";
  text: string;
}

export default function AiCompanion() {
  const insets = useSafeAreaInsets();
  const { output } = useAudioOutput();
  const { language, t } = useLanguage();
  const { reduceMotion } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isBuildingGame, setIsBuildingGame] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    { role: "assistant", text: t("companion_greeting") },
  ]);
  const [tabBarVisible, setTabBarVisible] = useState(true);

  const recorder = useAudioRecorder(VOICE_RECORDING_OPTIONS);
  const historyRef = useRef<CompanionTurn[]>([]);
  const { runGuarded, isLocked } = useAsyncGuard();

  // Conversation history holds text in whatever language it was generated
  // in — without this, switching the language back and forth left old
  // replies (in the previous language) sitting in the chat and in the
  // context sent to Gemini. Reset on every language change, skipping the
  // very first mount since the initial state above is already correct.
  const isFirstLanguageRender = useRef(true);
  useEffect(() => {
    if (isFirstLanguageRender.current) {
      isFirstLanguageRender.current = false;
      return;
    }
    historyRef.current = [];
    setMessages([{ role: "assistant", text: t("companion_greeting") }]);
  }, [language]);

  // The companion FAB is mounted outside the tab navigator, so it has no
  // way to know the tab bar's height — instead we just track whether the
  // currently focused route is one of the tabbed screens and add extra
  // clearance so we never sit on top of the tab bar.
  useEffect(() => {
    const updateTabBarVisibility = () => {
      if (!navigationRef.isReady()) return;
      const routeName = navigationRef.getCurrentRoute()?.name;
      setTabBarVisible(routeName ? TAB_SCREENS.has(routeName) : true);
    };
    updateTabBarVisibility();
    const unsubscribe = navigationRef.addListener("state", updateTabBarVisibility);
    return unsubscribe;
  }, []);

  const openCompanion = () => {
    setIsOpen(true);
    if (messages.length === 1) {
      speakFeedback(t("companion_greeting"), 1.0);
    }
  };

  const closeCompanion = () => {
    stopSpeech();
    if (isRecording) {
      recorder.stop().catch(() => {});
      setPlaybackAudioMode(output === "earpiece").catch(() => {});
      setIsRecording(false);
    }
    setIsOpen(false);
  };

  const startRecording = () => {
    runGuarded(async () => {
      setErrorText(null);
      try {
        let perm = await getRecordingPermissionsAsync();
        if (!perm.granted) {
          perm = await requestRecordingPermissionsAsync();
        }
        if (!perm.granted) {
          setErrorText(t("companion_mic_permission_denied"));
          return;
        }

        await setRecordingAudioMode();
        await recorder.prepareToRecordAsync();
        recorder.record();
        setIsRecording(true);
      } catch (err) {
        console.warn("[AiCompanion] failed to start recording", err);
        setErrorText(t("companion_start_failed"));
      }
    });
  };

  const stopRecordingAndSend = () => {
    runGuarded(async () => {
      if (!isRecording) return;
      setIsRecording(false);
      setIsThinking(true);
      setErrorText(null);

      try {
        await recorder.stop();
        // Switch back out of the recording audio session immediately so the
        // reply below plays through the loudspeaker instead of the earpiece.
        await setPlaybackAudioMode(output === "earpiece");

        const uri = recorder.uri;
        if (!uri) throw new Error("No recording uri");

        const audioBase64 = await new File(uri).base64();

        const response = await api.askCompanion(audioBase64, "audio/m4a", historyRef.current, language);

        const userText = response.transcript?.trim() || t("companion_no_transcript");
        const newTurns: CompanionTurn[] = [
          { role: "user", text: userText },
          { role: "assistant", text: response.reply },
        ];
        historyRef.current = [...historyRef.current, ...newTurns].slice(-10);

        setMessages((prev) => [
          ...prev,
          { role: "user", text: userText },
          { role: "assistant", text: response.reply },
        ]);

        speakFeedback(response.reply, 0.95);

        if (response.action?.type === "navigate_game" && response.action.target) {
          const navigated = navigateToGame(response.action.target);
          if (navigated) {
            if (response.action.startAfterNavigate) {
              // Give the destination screen a moment to mount and register
              // its start handler before we try to trigger it.
              setTimeout(() => triggerScreenStart(), 500);
            }
            setTimeout(closeCompanion, 900);
          }
        } else if (response.action?.type === "navigate_screen" && response.action.target) {
          const navigated = navigateToTab(response.action.target);
          if (navigated) setTimeout(closeCompanion, 900);
        } else if (response.action?.type === "generate_game" && response.action.gamePrompt) {
          setIsBuildingGame(true);
          try {
            const built = await api.generateGame(response.action.gamePrompt, language);
            const fullGame: GeneratedGameDefinition = { id: slugifyGameId(built.title), ...built };
            const saved = await saveLocalGeneratedGame(fullGame, response.action.gamePrompt);
            navigateToGeneratedGame(saved.id, saved.title, saved);
            closeCompanion();
          } catch (err) {
            console.warn("[AiCompanion] game generation failed", err);
            setErrorText(t("companion_game_generation_failed"));
            speakFeedback(t("companion_game_generation_failed"), 0.95);
          } finally {
            setIsBuildingGame(false);
          }
        }
      } catch (err) {
        console.warn("[AiCompanion] request failed", err);
        setErrorText(t("companion_request_failed"));
        speakFeedback(t("companion_request_failed_spoken"), 0.95);
      } finally {
        setIsThinking(false);
      }
    });
  };

  return (
    <>
      <Pressable
        onPress={openCompanion}
        accessibilityLabel={t("companion_fab_label")}
        accessibilityRole="button"
        accessibilityHint={t("companion_tap_to_speak")}
        className="absolute right-5 h-18 w-18 items-center justify-center rounded-full border-2 border-white bg-teal-700 shadow-lg"
        style={{ bottom: insets.bottom + (tabBarVisible ? 92 : 24) }}
      >
        <Mic size={28} color="white" />
      </Pressable>

      <Modal visible={isOpen} animationType={reduceMotion ? "none" : "slide"} onRequestClose={closeCompanion}>
        <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <View>
              <Text className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">{t("companion_title")}</Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">{t("companion_subtitle")}</Text>
            </View>
            <Pressable
              onPress={closeCompanion}
              accessibilityLabel="Close"
              className="rounded-full bg-zinc-200 p-3 dark:bg-zinc-800"
            >
              <X size={20} color="#71717a" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
            {messages.map((m, idx) => (
              <View
                key={idx}
                className={`max-w-[85%] rounded-3xl px-5 py-4 ${
                  m.role === "user"
                    ? "self-end bg-teal-600"
                    : "self-start border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <Text
                  className={`text-base leading-relaxed ${
                    m.role === "user" ? "text-white" : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {m.text}
                </Text>
              </View>
            ))}
            {isThinking && !isBuildingGame && (
              <View className="max-w-[85%] flex-row items-center gap-3 self-start rounded-3xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
                <ActivityIndicator color="#0d9488" />
                <Text className="text-base text-zinc-500 dark:text-zinc-400">{t("companion_thinking")}</Text>
              </View>
            )}
            {isBuildingGame && (
              <View className="max-w-[85%] flex-row items-center gap-3 self-start rounded-3xl border border-violet-200 bg-violet-50 px-5 py-4 dark:border-violet-800 dark:bg-violet-950/40">
                <ActivityIndicator color="#6d28d9" />
                <Text className="text-base text-violet-700 dark:text-violet-300">{t("companion_building_game")}</Text>
              </View>
            )}
            {errorText && (
              <View className="max-w-[85%] self-start rounded-3xl border border-rose-300 bg-rose-50 px-5 py-4">
                <Text className="text-base text-rose-700">{errorText}</Text>
              </View>
            )}
          </ScrollView>

          <View
            className="items-center gap-3 border-t border-zinc-200 px-5 pt-5 dark:border-zinc-800"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <Text className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {isBuildingGame
                ? t("companion_building_game")
                : isThinking
                  ? t("companion_please_wait")
                  : isRecording
                    ? t("companion_listening")
                    : t("companion_tap_to_speak")}
            </Text>
            <Pressable
              onPress={isRecording ? stopRecordingAndSend : startRecording}
              disabled={isThinking || isLocked()}
              accessibilityLabel={isRecording ? t("companion_listening") : t("companion_tap_to_speak")}
              className={`h-24 w-24 items-center justify-center rounded-full ${
                isRecording ? "bg-rose-600" : "bg-teal-600"
              } ${isThinking ? "opacity-40" : ""}`}
            >
              {isRecording ? <Square size={30} color="white" /> : <Mic size={34} color="white" />}
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
