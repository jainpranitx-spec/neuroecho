import React, { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { CameraOff, CheckCircle2, Play, XCircle } from "lucide-react-native";
import { MOTION_TARGETS } from "../../lib/gameData";
import { speakFeedback } from "../../lib/speech";
import { api } from "../../lib/api";
import ConfettiBurst, { ConfettiBurstHandle } from "../../components/ConfettiBurst";

export default function MotionMatchScreen() {
  const [targetList] = useState(MOTION_TARGETS);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const currentTarget = targetList[currentTargetIndex];

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [reactionTimeMs, setReactionTimeMs] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [lastActionResult, setLastActionResult] = useState<{
    correct: boolean;
    targetLabel: string;
  } | null>(null);

  const confettiRef = useRef<ConfettiBurstHandle>(null);
  // Absorbs same-tick double-fires (a stuck touch, an accidental double-tap)
  // without throttling legitimate fast reactions on the next target — see
  // SpotAiLieScreen for the general pattern this is a variant of.
  const actionLockRef = useRef(false);
  const startGameLockRef = useRef(false);

  const handleStartGame = async () => {
    if (startGameLockRef.current) return;
    startGameLockRef.current = true;
    setIsPlaying(true);
    setCurrentTargetIndex(0);
    setScore(0);
    setCombo(0);
    setLastActionResult(null);
    startTimeRef.current = Date.now();

    try {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          setCameraError("Camera permission denied. Dual-task simulator active!");
        }
      }
      speakFeedback("Motion match started! Tap Left for Fruit, Right for Machine.");
    } catch (err) {
      console.warn("[MotionMatch] camera permission request failed", err);
      setCameraError("Couldn't reach the camera. Dual-task simulator active!");
    } finally {
      startGameLockRef.current = false;
    }
  };

  const handleGestureAction = (actionTaken: "left" | "right") => {
    if (!isPlaying || actionLockRef.current) return;
    actionLockRef.current = true;
    setTimeout(() => {
      actionLockRef.current = false;
    }, 120);

    const reactionTime = Date.now() - startTimeRef.current;
    setReactionTimeMs(reactionTime);

    const isCorrectAction = actionTaken === currentTarget.requiredAction;
    setLastActionResult({ correct: isCorrectAction, targetLabel: currentTarget.label });

    if (isCorrectAction) {
      const addedXp = Math.max(50, 100 - Math.floor(reactionTime / 50));
      setScore((prev) => prev + addedXp);
      setCombo((prev) => prev + 1);
      speakFeedback("Correct gesture!", 1.1);
      if (combo > 2) confettiRef.current?.fire();
    } else {
      setCombo(0);
      speakFeedback("Incorrect! Fruit = Left, Machine = Right.", 1.0);
    }

    setCurrentTargetIndex((prev) => (prev + 1) % targetList.length);
    startTimeRef.current = Date.now();
  };

  const handleEndGame = () => {
    setIsPlaying(false);
    api
      .saveSession({
        gameType: "motion-match",
        score,
        maxScore: 500,
        accuracyPercentage: score > 300 ? 95 : 80,
        durationSeconds: 30,
        details: { summary: "Completed Dual-Task Motor Training Session", reactionTimeMs },
      })
      .catch((e) => console.warn("[MotionMatch] session save failed", e));
  };

  const hasCamera = isPlaying && permission?.granted;

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ConfettiBurst ref={confettiRef} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Dual-Task rule: Fruit = Left, Machine = Right
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="rounded-2xl bg-teal-50 px-3 py-2">
              <Text className="text-base font-bold text-teal-700">{score} XP</Text>
            </View>
            <View className="rounded-2xl bg-amber-50 px-3 py-2">
              <Text className="text-sm font-bold text-amber-700">Streak: {combo}x</Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 flex-row items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
            <Text className="text-2xl">👈</Text>
            <View className="flex-1">
              <Text className="text-xs font-bold uppercase text-emerald-700">Left Hand</Text>
              <Text className="text-base font-black text-zinc-900">FRUIT / FOOD 🍎🍌🍊</Text>
            </View>
          </View>
          <View className="flex-1 flex-row items-center gap-3 rounded-2xl border border-blue-300 bg-blue-50 p-4">
            <Text className="text-2xl">👉</Text>
            <View className="flex-1">
              <Text className="text-xs font-bold uppercase text-blue-700">Right Hand</Text>
              <Text className="text-base font-black text-zinc-900">MACHINE / TOOL 🚜⚙️🔨</Text>
            </View>
          </View>
        </View>

        <View className="gap-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-white">Gesture Target Stage</Text>
            {!isPlaying ? (
              <Pressable
                onPress={handleStartGame}
                className="flex-row items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3"
              >
                <Play size={16} color="white" />
                <Text className="text-sm font-bold text-white">Start</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleEndGame}
                className="rounded-2xl bg-zinc-800 px-4 py-2.5"
              >
                <Text className="text-sm font-semibold text-zinc-300">End Stage</Text>
              </Pressable>
            )}
          </View>

          <View className="h-64 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {hasCamera && (
              <CameraView style={StyleSheet.absoluteFill} facing="front" />
            )}
            {hasCamera && (
              <View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(9,9,11,0.7)" }]}
              />
            )}

            {!hasCamera && (
              <View className="items-center gap-2 px-6">
                <CameraOff size={32} color="#52525b" />
                <Text className="text-center text-sm text-zinc-400">
                  {cameraError ||
                    "Press Start to enable the camera preview, or just use the gesture pads below."}
                </Text>
              </View>
            )}

            <View className="absolute top-6 z-10 max-w-xs flex-row items-center gap-4 rounded-3xl border-2 border-teal-400/80 bg-zinc-900/90 p-5">
              <Text className="text-4xl">{currentTarget.emoji}</Text>
              <View>
                <Text className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Target Object
                </Text>
                <Text className="text-xl font-black text-white">{currentTarget.label}</Text>
                <Text className="text-xs text-zinc-300">
                  Category:{" "}
                  <Text className="font-bold uppercase text-amber-400">
                    {currentTarget.category}
                  </Text>
                </Text>
              </View>
            </View>

            {lastActionResult && (
              <View className="absolute bottom-4 z-10 rounded-full border border-zinc-700 bg-zinc-900/90 px-5 py-2">
                {lastActionResult.correct ? (
                  <View className="flex-row items-center gap-1.5">
                    <CheckCircle2 size={16} color="#34d399" />
                    <Text className="text-sm font-bold text-emerald-400">Correct Gesture!</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5">
                    <XCircle size={16} color="#fb7185" />
                    <Text className="text-sm font-bold text-rose-400">Incorrect!</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View className="flex-row gap-4">
            <Pressable
              onPress={() => handleGestureAction("left")}
              disabled={!isPlaying}
              className="flex-1 items-center gap-1 rounded-2xl bg-emerald-600 py-6 disabled:opacity-40"
            >
              <Text className="text-2xl">👈 🍎</Text>
              <Text className="text-lg font-extrabold text-white">RAISE LEFT</Text>
              <Text className="text-xs text-white/80">(Fruit / Food)</Text>
            </Pressable>
            <Pressable
              onPress={() => handleGestureAction("right")}
              disabled={!isPlaying}
              className="flex-1 items-center gap-1 rounded-2xl bg-blue-600 py-6 disabled:opacity-40"
            >
              <Text className="text-2xl">🚜 👉</Text>
              <Text className="text-lg font-extrabold text-white">RAISE RIGHT</Text>
              <Text className="text-xs text-white/80">(Machine / Tool)</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
