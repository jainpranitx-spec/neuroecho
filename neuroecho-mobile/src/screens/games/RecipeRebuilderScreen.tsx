import React, { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  RotateCcw,
  Utensils,
  XCircle,
} from "lucide-react-native";
import { RECIPE_ITEMS } from "../../lib/gameData";
import { RecipeItem } from "../../lib/types";
import { speakFeedback } from "../../lib/speech";
import { api } from "../../lib/api";
import ConfettiBurst, { ConfettiBurstHandle } from "../../components/ConfettiBurst";

export default function RecipeRebuilderScreen() {
  const [recipes] = useState<RecipeItem[]>(RECIPE_ITEMS);
  const [currentRecipeIdx, setCurrentRecipeIdx] = useState(0);
  const currentRecipe = recipes[currentRecipeIdx];

  const [steps, setSteps] = useState(currentRecipe.scrambledSteps);
  const [hasVerified, setHasVerified] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [incorrectIndexes, setIncorrectIndexes] = useState<number[]>([]);

  const confettiRef = useRef<ConfettiBurstHandle>(null);
  // See SpotAiLieScreen for why a ref (not the `hasVerified` state) guards
  // re-entry: state reads are stale across two taps landing in one tick.
  const hasVerifiedRef = useRef(false);

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= steps.length || hasVerifiedRef.current) return;
    const newSteps = [...steps];
    const [moved] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, moved);
    setSteps(newSteps);
  };

  const handleVerifySequence = () => {
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;
    setHasVerified(true);

    const wrongSteps: number[] = [];
    steps.forEach((step, idx) => {
      if (step.correctIndex !== idx) wrongSteps.push(idx);
    });
    setIncorrectIndexes(wrongSteps);

    const correct = wrongSteps.length === 0;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100);
      confettiRef.current?.fire();
      speakFeedback("Perfect sequence! Delicious execution!");
      api
        .saveSession({
          gameType: "recipe-rebuilder",
          score: 100,
          maxScore: 100,
          accuracyPercentage: 100,
          durationSeconds: 25,
          details: {
            recipeTitle: currentRecipe.title,
            summary: "Successfully rebuilt 5-step recipe sequence",
          },
        })
        .catch((e) => console.warn("[RecipeRebuilder] session save failed", e));
    } else {
      speakFeedback("Almost there! Review the steps highlighted in red.");
      const partialScore = Math.max(20, 100 - wrongSteps.length * 20);
      api
        .saveSession({
          gameType: "recipe-rebuilder",
          score: partialScore,
          maxScore: 100,
          accuracyPercentage: partialScore,
          durationSeconds: 30,
          details: {
            recipeTitle: currentRecipe.title,
            summary: `Misplaced ${wrongSteps.length} steps`,
          },
        })
        .catch((e) => console.warn("[RecipeRebuilder] session save failed", e));
    }
  };

  const handleNextRecipe = () => {
    const nextIdx = (currentRecipeIdx + 1) % recipes.length;
    setCurrentRecipeIdx(nextIdx);
    setSteps(recipes[nextIdx].scrambledSteps);
    setHasVerified(false);
    hasVerifiedRef.current = false;
    setIsCorrect(null);
    setIncorrectIndexes([]);
  };

  const reshuffle = () => {
    setSteps([...currentRecipe.scrambledSteps].sort(() => Math.random() - 0.5));
    setHasVerified(false);
    hasVerifiedRef.current = false;
    setIsCorrect(null);
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ConfettiBurst ref={confettiRef} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View className="flex-row items-center justify-end">
          <View className="rounded-2xl bg-emerald-50 px-4 py-2">
            <Text className="text-lg font-bold text-emerald-700">{score} Points</Text>
          </View>
        </View>

        <View className="gap-5 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="rounded-2xl bg-emerald-100 p-3">
                <Utensils size={22} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  {currentRecipe.category} • {currentRecipe.estimatedTime}
                </Text>
                <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{currentRecipe.title}</Text>
              </View>
            </View>
            <Pressable
              onPress={reshuffle}
              className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-700"
              accessibilityLabel="Reshuffle steps"
            >
              <RotateCcw size={18} color="#71717a" />
            </Pressable>
          </View>

          <View className="gap-3">
            {steps.map((step, idx) => {
              const isMisplaced = hasVerified && incorrectIndexes.includes(idx);
              const isVerifiedCorrect = hasVerified && !incorrectIndexes.includes(idx);
              let cls = "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60";
              if (isVerifiedCorrect) cls = "border-emerald-500 bg-emerald-50";
              else if (isMisplaced) cls = "border-rose-500 bg-rose-50";

              return (
                <View
                  key={step.id}
                  className={`flex-row items-center justify-between gap-3 rounded-2xl border p-4 ${cls}`}
                >
                  <View className="flex-1 flex-row items-center gap-3">
                    <View className="h-9 w-9 items-center justify-center rounded-2xl bg-zinc-200 dark:bg-zinc-700">
                      <Text className="text-base font-extrabold text-zinc-800 dark:text-zinc-200">{idx + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold leading-snug text-zinc-800 dark:text-zinc-200">
                        {step.text}
                      </Text>
                      {step.tip && (
                        <Text className="text-xs italic text-zinc-400">Tip: {step.tip}</Text>
                      )}
                    </View>
                  </View>

                  {!hasVerified && (
                    <View className="flex-row gap-1">
                      <Pressable
                        onPress={() => moveStep(idx, idx - 1)}
                        disabled={idx === 0}
                        className="rounded-xl border border-zinc-200 bg-white p-2.5 disabled:opacity-30 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <ArrowUp size={18} color="#3f3f46" />
                      </Pressable>
                      <Pressable
                        onPress={() => moveStep(idx, idx + 1)}
                        disabled={idx === steps.length - 1}
                        className="rounded-xl border border-zinc-200 bg-white p-2.5 disabled:opacity-30 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <ArrowDown size={18} color="#3f3f46" />
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {!hasVerified && (
            <Pressable
              onPress={handleVerifySequence}
              className="flex-row items-center justify-center gap-3 rounded-3xl bg-emerald-600 py-6"
            >
              <CheckCircle2 size={26} color="white" />
              <Text className="text-xl font-extrabold uppercase tracking-wide text-white">
                Verify Recipe Sequence
              </Text>
            </Pressable>
          )}
        </View>

        {hasVerified && (
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
                  <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {isCorrect ? "Perfect Culinary Order!" : "Sequence Needs Adjustment"}
                  </Text>
                  <Text className="text-sm font-medium text-zinc-600">
                    {isCorrect
                      ? "All 5 steps are in perfect chronological order!"
                      : `${incorrectIndexes.length} step(s) were misplaced.`}
                  </Text>
                </View>
              </View>
              <Text className="text-2xl font-black text-emerald-600">
                +{isCorrect ? 100 : Math.max(20, 100 - incorrectIndexes.length * 20)} XP
              </Text>
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <Pressable
                onPress={() => {
                  setHasVerified(false);
                  hasVerifiedRef.current = false;
                }}
                className="flex-row items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <RotateCcw size={16} color="#3f3f46" />
                <Text className="text-sm font-semibold text-zinc-700">Adjust Steps</Text>
              </Pressable>
              <Pressable
                onPress={handleNextRecipe}
                className="flex-row items-center gap-3 rounded-2xl bg-teal-600 px-8 py-4"
              >
                <Text className="text-lg font-bold text-white">Next Recipe</Text>
                <ArrowRight size={18} color="white" />
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
