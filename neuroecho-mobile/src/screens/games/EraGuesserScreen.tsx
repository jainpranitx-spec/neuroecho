import React, { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  ArrowRight,
  CheckCircle2,
  Gamepad2,
  Lightbulb,
  Radio,
  Smartphone,
  Tv,
  XCircle,
} from "lucide-react-native";
import { ERA_GUESSER_ITEMS } from "../../lib/gameData";
import { speakFeedback } from "../../lib/speech";
import { api } from "../../lib/api";
import ConfettiBurst, { ConfettiBurstHandle } from "../../components/ConfettiBurst";

export default function EraGuesserScreen() {
  const [items] = useState(ERA_GUESSER_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = items[currentIndex];

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const confettiRef = useRef<ConfettiBurstHandle>(null);

  const handleSelectOption = (index: number) => {
    if (hasGuessed) return;
    setSelectedOptionIndex(index);
    setHasGuessed(true);

    const option = currentItem.options[index];
    const correct = option.isCorrect;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100);
      confettiRef.current?.fire();
      speakFeedback("Spot on! You found the anachronistic item!");
      api
        .saveSession({
          gameType: "era-guesser",
          score: 100,
          maxScore: 100,
          accuracyPercentage: 100,
          durationSeconds: 12,
          details: {
            title: currentItem.title,
            decade: currentItem.trueDecade,
            summary: "Correctly identified anachronism",
          },
        })
        .catch(() => {});
    } else {
      speakFeedback("Nice try! Review the historical context below.");
      api
        .saveSession({
          gameType: "era-guesser",
          score: 40,
          maxScore: 100,
          accuracyPercentage: 40,
          durationSeconds: 15,
          details: {
            title: currentItem.title,
            decade: currentItem.trueDecade,
            summary: "Incorrect guess",
          },
        })
        .catch(() => {});
    }
  };

  const handleNextItem = () => {
    setHasGuessed(false);
    setSelectedOptionIndex(null);
    setIsCorrect(null);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const renderDiorama = () => {
    switch (currentItem.imageType) {
      case "victorian_smartphone":
        return (
          <View className="h-64 justify-between rounded-2xl border border-amber-900/40 bg-amber-950 p-5">
            <Text className="text-xs uppercase tracking-widest text-amber-300/80">
              1890s Victorian Parlor Scene
            </Text>
            <View className="flex-row items-center justify-center gap-6">
              <DioramaIcon icon={<Radio size={24} color="#fcd34d" />} label="Gramophone" />
              <DioramaIcon
                icon={<Smartphone size={24} color="#5eead4" />}
                label="Modern Smartphone"
                highlighted
              />
              <DioramaIcon icon={<Tv size={24} color="#fcd34d" />} label="Silver Tea Set" />
            </View>
            <Text className="text-center text-xs italic text-amber-300/70">
              An elegant velvet tea table... and an unexpected glass device!
            </Text>
          </View>
        );
      case "diner_bluetooth":
        return (
          <View className="h-64 justify-between rounded-2xl border border-red-900/40 bg-red-950 p-5">
            <Text className="text-xs uppercase tracking-widest text-red-300">
              1950s American Diner Counter
            </Text>
            <View className="flex-row items-center justify-center gap-6">
              <DioramaIcon icon={<Text className="text-3xl">🥤</Text>} label="Milkshake" />
              <DioramaIcon
                icon={<Radio size={24} color="#5eead4" />}
                label="Wireless BT Speaker"
                highlighted
              />
              <DioramaIcon icon={<Text className="text-3xl">🎷</Text>} label="Jukebox Vinyl" />
            </View>
            <Text className="text-center text-xs italic text-red-300/80">
              Chrome diner counter... and a modern wireless speaker!
            </Text>
          </View>
        );
      default:
        return (
          <View className="h-64 justify-between rounded-2xl border border-teal-900/40 bg-teal-950 p-5">
            <Text className="text-xs uppercase tracking-widest text-teal-300">
              Historical Scene Preview
            </Text>
            <View className="flex-row items-center justify-center gap-6">
              <DioramaIcon icon={<Gamepad2 size={24} color="#5eead4" />} label="Arcade Cabinet" />
              <DioramaIcon
                icon={<Text className="text-3xl">📱</Text>}
                label="Modern Tablet"
                highlighted
              />
            </View>
            <Text className="text-center text-xs italic text-teal-300/80">
              {currentItem.visualDescription}
            </Text>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-zinc-50">
      <ConfettiBurst ref={confettiRef} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-zinc-500">
            Scene {currentIndex + 1} of {items.length}
          </Text>
          <View className="rounded-2xl bg-blue-50 px-4 py-2">
            <Text className="text-lg font-bold text-blue-700">{score} Points</Text>
          </View>
        </View>

        <View className="gap-5 rounded-3xl border border-zinc-200 bg-white p-5">
          <View>
            <Text className="text-xs font-bold uppercase tracking-wide text-blue-600">
              {currentItem.trueDecade}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-zinc-900">{currentItem.title}</Text>
          </View>

          {renderDiorama()}

          <View className="items-center">
            <Text className="text-center text-lg font-bold text-zinc-800">
              Which item is anachronistic and doesn&apos;t belong in the {currentItem.trueDecade}?
            </Text>
            <Text className="mt-1 text-xs text-zinc-400">Tap your guess below</Text>
          </View>

          <View className="gap-3">
            {currentItem.options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;
              const isTargetCorrect = opt.isCorrect;
              let cls = "border-zinc-200 bg-white";
              if (hasGuessed && isTargetCorrect) cls = "border-emerald-500 bg-emerald-50";
              else if (hasGuessed && isSelected && !isTargetCorrect)
                cls = "border-rose-500 bg-rose-50";

              return (
                <Pressable
                  key={idx}
                  onPress={() => handleSelectOption(idx)}
                  disabled={hasGuessed}
                  className={`flex-row items-center justify-between rounded-2xl border px-6 py-4 ${cls}`}
                >
                  <Text className="flex-1 text-lg font-bold text-zinc-800">{opt.label}</Text>
                  {hasGuessed && isTargetCorrect && <CheckCircle2 size={22} color="#059669" />}
                  {hasGuessed && isSelected && !isTargetCorrect && (
                    <XCircle size={22} color="#e11d48" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {hasGuessed && (
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
                    {isCorrect ? "Correct Identification!" : "Historical Insight"}
                  </Text>
                  <Text className="text-sm font-medium text-zinc-600">
                    Anachronism: {currentItem.anachronismItem}
                  </Text>
                </View>
              </View>
              <Text className="text-2xl font-black text-blue-600">
                +{isCorrect ? 100 : 40} XP
              </Text>
            </View>

            <View className="gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
              <View className="flex-row items-center gap-2">
                <Lightbulb size={16} color="#2563eb" />
                <Text className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Historical Recall Detail
                </Text>
              </View>
              <Text className="text-base font-medium leading-relaxed text-zinc-800">
                {currentItem.correctExplanation}
              </Text>
            </View>

            <Pressable
              onPress={handleNextItem}
              className="flex-row items-center justify-center gap-3 self-end rounded-2xl bg-teal-600 px-8 py-4"
            >
              <Text className="text-lg font-bold text-white">Next Era Scene</Text>
              <ArrowRight size={18} color="white" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DioramaIcon({
  icon,
  label,
  highlighted,
}: {
  icon: React.ReactNode;
  label: string;
  highlighted?: boolean;
}) {
  return (
    <View className="items-center gap-1">
      <View
        className={`h-14 w-14 items-center justify-center rounded-2xl border-2 ${
          highlighted ? "border-teal-400 bg-zinc-900" : "border-zinc-700 bg-zinc-800"
        }`}
      >
        {icon}
      </View>
      <Text
        className={`text-[10px] font-semibold ${highlighted ? "text-teal-300" : "text-zinc-300"}`}
      >
        {label}
      </Text>
    </View>
  );
}
