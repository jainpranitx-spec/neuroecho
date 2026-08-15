import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { registerScreenActions, clearScreenActions } from "../../lib/screenActions";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Pause,
  Play,
  PlusCircle,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react-native";
import { SPOT_LIE_STORIES } from "../../lib/gameData";
import { StoryLieItem } from "../../lib/types";
import { speakFeedback, speakText, stopSpeech } from "../../lib/speech";
import { api } from "../../lib/api";
import ConfettiBurst, { ConfettiBurstHandle } from "../../components/ConfettiBurst";
import { useAsyncGuard } from "../../lib/useAsyncGuard";

export default function SpotAiLieScreen() {
  const [stories, setStories] = useState<StoryLieItem[]>(SPOT_LIE_STORIES);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const story = stories[currentStoryIndex] || stories[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [speechRate, setSpeechRate] = useState(0.85);

  const [buzzedSentenceIndex, setBuzzedSentenceIndex] = useState<number | null>(null);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingAiStory, setIsGeneratingAiStory] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const speechControllerRef = useRef<{ cancel: () => void } | null>(null);
  const confettiRef = useRef<ConfettiBurstHandle>(null);
  const generateGuard = useAsyncGuard();
  // Mirrors `hasBuzzed` but updates synchronously — `hasBuzzed` itself can't
  // guard against a double-tap landing before the first tap's re-render,
  // since both reads would still see the stale `false` from the same
  // closure. See useAsyncGuard.ts for the full explanation.
  const hasBuzzedRef = useRef(false);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Registered once so the AI companion can trigger playback via voice
  // command ("open Spot the AI Lie and start it") — the ref keeps it
  // pointed at the latest startPlayback closure without re-registering
  // on every render.
  const startPlaybackRef = useRef<() => void>(() => {});
  useEffect(() => {
    const handlers = { start: () => startPlaybackRef.current() };
    registerScreenActions(handlers);
    return () => clearScreenActions(handlers);
  }, []);

  const resetRound = () => {
    stopSpeech();
    setIsPlaying(false);
    setHasBuzzed(false);
    hasBuzzedRef.current = false;
    setIsCorrect(null);
    setBuzzedSentenceIndex(null);
    setActiveSentenceIndex(-1);
  };

  const startPlayback = () => {
    stopSpeech();
    setIsPlaying(true);
    setHasBuzzed(false);
    hasBuzzedRef.current = false;
    setIsCorrect(null);
    setBuzzedSentenceIndex(null);
    setActiveSentenceIndex(0);

    const fullText = story.sentences.join(" ");

    speechControllerRef.current = speakText(
      fullText,
      speechRate,
      (sentenceIdx) => setActiveSentenceIndex(sentenceIdx),
      () => setIsPlaying(false)
    );
  };
  startPlaybackRef.current = startPlayback;

  const pausePlayback = () => {
    stopSpeech();
    setIsPlaying(false);
  };

  const handleBuzzerPress = (overrideIndex?: number) => {
    if (hasBuzzedRef.current) return;
    hasBuzzedRef.current = true;

    stopSpeech();
    setIsPlaying(false);

    const targetedIdx = overrideIndex ?? (activeSentenceIndex >= 0 ? activeSentenceIndex : 0);
    setBuzzedSentenceIndex(targetedIdx);
    setHasBuzzed(true);

    const correct = targetedIdx === story.lieSentenceIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100);
      confettiRef.current?.fire();
      speakFeedback("Spot on! You caught the AI lie!", 0.95);
      api
        .saveSession({
          gameType: "spot-ai-lie",
          score: 100,
          maxScore: 100,
          accuracyPercentage: 100,
          durationSeconds: 15,
          details: {
            storyTitle: story.title,
            topic: story.topic,
            summary: "Successfully detected AI inaccuracy",
          },
        })
        .catch((e) => console.warn("[SpotAiLie] session save failed", e));
    } else {
      speakFeedback(
        "Good try! The lie was actually in a different sentence. Check the explanation below.",
        0.9
      );
      api
        .saveSession({
          gameType: "spot-ai-lie",
          score: 40,
          maxScore: 100,
          accuracyPercentage: 40,
          durationSeconds: 20,
          details: {
            storyTitle: story.title,
            topic: story.topic,
            summary: "Missed exact lie sentence",
          },
        })
        .catch((e) => console.warn("[SpotAiLie] session save failed", e));
    }
  };

  const handleGenerateCustomStory = () =>
    generateGuard.runGuarded(async () => {
      if (!customTopic.trim()) return;
      setIsGeneratingAiStory(true);
      setGenerationError(null);
      stopSpeech();
      try {
        const newStory = await api.generateStory(customTopic);
        newStory.id = `ai-custom-${Date.now()}`;
        setStories((prev) => [newStory, ...prev]);
        setCurrentStoryIndex(0);
        setCustomTopic("");
        setHasBuzzed(false);
        hasBuzzedRef.current = false;
        setIsCorrect(null);
        speakFeedback(`New story generated about ${newStory.topic}! Tap play to listen.`);
      } catch (err) {
        console.warn("[SpotAiLie] story generation failed", err);
        setGenerationError("Couldn't reach NeuroEcho AI — check your connection and try again.");
      } finally {
        setIsGeneratingAiStory(false);
      }
    });

  const handleNextStory = () => {
    stopSpeech();
    setIsPlaying(false);
    setHasBuzzed(false);
    hasBuzzedRef.current = false;
    setIsCorrect(null);
    setActiveSentenceIndex(-1);
    setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ConfettiBurst ref={confettiRef} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View className="flex-row items-center justify-between">
          <View className="rounded-2xl bg-amber-50 px-4 py-2 dark:bg-amber-950/40">
            <Text className="text-lg font-bold text-amber-700">{score} Points</Text>
          </View>
        </View>

        {/* Story selector */}
        <View className="gap-2">
          <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Select Story Topic
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {stories.map((st, idx) => (
              <Pressable
                key={st.id}
                onPress={() => {
                  resetRound();
                  setCurrentStoryIndex(idx);
                }}
                className={`rounded-2xl border px-4 py-2.5 ${
                  currentStoryIndex === idx
                    ? "border-amber-500 bg-amber-500"
                    : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    currentStoryIndex === idx ? "text-white" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {st.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Story card */}
        <View className="gap-5 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              {story.topic} {story.decade ? `(${story.decade})` : ""}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{story.title}</Text>
          </View>

          <View className="flex-row items-center gap-3">
            {!isPlaying ? (
              <Pressable
                onPress={startPlayback}
                className="flex-row items-center gap-2.5 rounded-2xl bg-teal-600 px-6 py-3.5"
              >
                <Play size={18} color="white" />
                <Text className="text-base font-bold text-white">Play Audio Story</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={pausePlayback}
                className="flex-row items-center gap-2.5 rounded-2xl bg-zinc-800 px-6 py-3.5"
              >
                <Pause size={18} color="white" />
                <Text className="text-base font-bold text-white">Pause Voice</Text>
              </Pressable>
            )}
            <Pressable
              onPress={resetRound}
              className="rounded-2xl border border-zinc-200 p-3.5 dark:border-zinc-700"
              accessibilityLabel="Reset audio"
            >
              <RotateCcw size={18} color="#71717a" />
            </Pressable>
          </View>

          {/* Speed selector */}
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Voice Speed:</Text>
            {[
              { rate: 0.75, label: "Slow 0.75x" },
              { rate: 0.85, label: "Gentle 0.85x" },
              { rate: 1.0, label: "Normal 1.0x" },
            ].map((opt) => (
              <Pressable
                key={opt.rate}
                onPress={() => setSpeechRate(opt.rate)}
                className={`rounded-xl border px-3 py-1.5 ${
                  speechRate === opt.rate ? "border-amber-500 bg-amber-500" : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    speechRate === opt.rate ? "text-white" : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Transcript */}
          <View className="gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/60">
            <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Live Story Transcript
            </Text>
            <Text className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200">
              {story.sentences.map((sent, idx) => {
                const isActive = activeSentenceIndex === idx;
                const isLieSentence = idx === story.lieSentenceIndex;
                const isBuzzedTarget = buzzedSentenceIndex === idx;
                let bg = "transparent";
                if (isActive) bg = "#fde68a80";
                else if (hasBuzzed && isLieSentence) bg = "#a7f3d080";
                else if (hasBuzzed && isBuzzedTarget && !isCorrect) bg = "#fecdd380";
                return (
                  <Text
                    key={idx}
                    onPress={() => {
                      setActiveSentenceIndex(idx);
                      if (isPlaying) handleBuzzerPress(idx);
                    }}
                    style={{ backgroundColor: bg }}
                  >
                    {sent}{" "}
                  </Text>
                );
              })}
            </Text>
          </View>

          {/* Buzzer */}
          <Pressable
            onPress={() => handleBuzzerPress()}
            disabled={hasBuzzed}
            className={`flex-row items-center justify-center gap-3 rounded-3xl py-6 ${
              hasBuzzed ? "bg-zinc-300" : "bg-amber-500"
            }`}
          >
            <AlertTriangle size={26} color={hasBuzzed ? "#71717a" : "white"} />
            <Text
              className={`text-xl font-black uppercase tracking-wide ${
                hasBuzzed ? "text-zinc-500" : "text-white"
              }`}
            >
              Wait, that&apos;s wrong!
            </Text>
          </Pressable>
        </View>

        {/* Feedback */}
        {hasBuzzed && (
          <View
            className={`gap-5 rounded-3xl border p-6 ${
              isCorrect ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
            }`}
          >
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1 flex-row items-center gap-3">
                <View
                  className={`rounded-2xl p-3 ${isCorrect ? "bg-emerald-600" : "bg-amber-600"}`}
                >
                  {isCorrect ? (
                    <CheckCircle2 size={26} color="white" />
                  ) : (
                    <XCircle size={26} color="white" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-zinc-900">
                    {isCorrect ? "Spot On! Excellent Ear!" : "Close Attempt!"}
                  </Text>
                  <Text className="text-sm font-medium text-zinc-600">
                    {isCorrect
                      ? "You correctly caught the AI lie sentence!"
                      : `The AI lie was in sentence #${story.lieSentenceIndex + 1}.`}
                  </Text>
                </View>
              </View>
              <Text className="text-2xl font-black text-amber-600">
                +{isCorrect ? 100 : 40} XP
              </Text>
            </View>

            <View className="gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <View className="flex-row items-center gap-2">
                <Lightbulb size={16} color="#d97706" />
                <Text className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Cognitive Memory Breakdown
                </Text>
              </View>
              <Text className="text-base font-medium leading-relaxed text-zinc-800">
                {story.explanation}
              </Text>
              <View className="flex-row items-start gap-2 border-t border-zinc-200 pt-3">
                <Sparkles size={14} color="#d97706" />
                <Text className="flex-1 text-sm text-zinc-500">
                  <Text className="font-bold">Fun Fact: </Text>
                  {story.funFact}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <Pressable
                onPress={startPlayback}
                className="flex-row items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 py-3"
              >
                <RotateCcw size={16} color="#3f3f46" />
                <Text className="text-sm font-semibold text-zinc-700">Listen Again</Text>
              </Pressable>
              <Pressable
                onPress={handleNextStory}
                className="flex-row items-center gap-3 rounded-2xl bg-teal-600 px-8 py-4"
              >
                <Text className="text-lg font-bold text-white">Next Story</Text>
                <ArrowRight size={18} color="white" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Custom AI story */}
        <View className="gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <View className="flex-row items-center gap-2">
            <Sparkles size={16} color="#0d9488" />
            <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Generate a Custom AI Memory Story
            </Text>
          </View>
          <Text className="text-xs text-zinc-500">
            Type any personal topic (e.g. &quot;Gardening in 1965&quot;) and NeuroEcho AI will
            write a fresh story with a hidden lie for you!
          </Text>
          <View className="flex-row gap-3">
            <TextInput
              value={customTopic}
              onChangeText={setCustomTopic}
              placeholder="e.g. Vintage Automobiles in Detroit"
              placeholderTextColor="#a1a1aa"
              className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              onSubmitEditing={handleGenerateCustomStory}
            />
            <Pressable
              onPress={handleGenerateCustomStory}
              disabled={isGeneratingAiStory}
              className="flex-row items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 disabled:opacity-50"
            >
              <PlusCircle size={16} color="white" />
              <Text className="text-sm font-semibold text-white">
                {isGeneratingAiStory ? "Writing..." : "Generate"}
              </Text>
            </Pressable>
          </View>
          {generationError && (
            <Text className="text-xs font-medium text-rose-600">{generationError}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
