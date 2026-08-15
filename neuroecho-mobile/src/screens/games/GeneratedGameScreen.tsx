import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowRight, CheckCircle2, Circle, Sparkles, XCircle } from "lucide-react-native";
import Text from "../../components/AccessibleText";
import HowToPlay from "../../components/HowToPlay";
import { getGeneratedGame } from "../../lib/generatedGames";
import { RootStackParamList } from "../../navigation/types";
import { speakFeedback } from "../../lib/speech";

type Props = NativeStackScreenProps<RootStackParamList, "GeneratedGame">;

const ACCENTS = {
  teal: { button: "bg-teal-700", pale: "bg-teal-50", text: "text-teal-800" },
  blue: { button: "bg-blue-700", pale: "bg-blue-50", text: "text-blue-800" },
  amber: { button: "bg-amber-700", pale: "bg-amber-50", text: "text-amber-900" },
  emerald: { button: "bg-emerald-700", pale: "bg-emerald-50", text: "text-emerald-800" },
};

export default function GeneratedGameScreen({ route, navigation }: Props) {
  const game = useMemo(() => getGeneratedGame(route.params.gameId), [route.params.gameId]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const locked = useRef(false);

  if (!game) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white p-8 dark:bg-black">
        <Text accessibilityRole="header" className="text-2xl font-extrabold text-zinc-950 dark:text-white">
          This game is not in this app version yet
        </Text>
        <Text className="text-center text-base leading-relaxed text-zinc-700 dark:text-zinc-200">
          Update NeuroEcho after your game request has been reviewed and released.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} className="min-h-14 justify-center rounded-2xl bg-teal-700 px-6">
          <Text className="text-lg font-bold text-white">Back to games</Text>
        </Pressable>
      </View>
    );
  }

  const round = game.rounds[roundIndex];
  const accent = ACCENTS[game.accent];
  const isLast = roundIndex === game.rounds.length - 1;

  const choose = (index: number) => {
    if (locked.current || !round.choices) return;
    locked.current = true;
    setSelectedIndex(index);
    const correct = round.choices[index].isCorrect;
    if (correct) setScore((value) => value + 1);
    speakFeedback(correct ? round.successMessage : "Good try. You can continue when you are ready.");
  };

  const completeChallenge = () => {
    if (locked.current) return;
    locked.current = true;
    setCompleted(true);
    setScore((value) => value + 1);
    speakFeedback(round.successMessage);
  };

  const next = () => {
    if (isLast) {
      setRoundIndex(0);
      setScore(0);
    } else {
      setRoundIndex((value) => value + 1);
    }
    locked.current = false;
    setSelectedIndex(null);
    setCompleted(false);
  };

  const answered = selectedIndex !== null || completed;

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 40 }}>
        <View className="flex-row flex-wrap items-center justify-between gap-3">
          <Text className="text-base font-bold text-zinc-700 dark:text-zinc-200">
            Round {roundIndex + 1} of {game.rounds.length}
          </Text>
          <Text className={`rounded-full px-4 py-2 text-base font-extrabold ${accent.pale} ${accent.text}`}>
            Score {score}
          </Text>
        </View>

        <HowToPlay steps={game.instructions} />

        <View className="gap-5 rounded-3xl border-2 border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
          <View className={`self-start rounded-2xl p-3 ${accent.pale}`}>
            <Sparkles size={28} color="#0f766e" />
          </View>
          <Text accessibilityRole="header" className="text-2xl font-extrabold leading-relaxed text-zinc-950 dark:text-white">
            {round.prompt}
          </Text>
          {round.instruction && (
            <Text className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-200">{round.instruction}</Text>
          )}

          {round.choices ? (
            <View className="gap-3">
              {round.choices.map((choice, index) => {
                const selected = selectedIndex === index;
                const showCorrect = answered && choice.isCorrect;
                return (
                  <Pressable
                    key={`${roundIndex}-${index}`}
                    onPress={() => choose(index)}
                    disabled={answered}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: answered }}
                    className={`min-h-16 flex-row items-center gap-3 rounded-2xl border-2 p-4 ${
                      showCorrect ? "border-emerald-600 bg-emerald-50" : selected ? "border-rose-600 bg-rose-50" : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
                    }`}
                  >
                    {showCorrect ? <CheckCircle2 size={25} color="#047857" /> : selected ? <XCircle size={25} color="#be123c" /> : <Circle size={25} color="#52525b" />}
                    <Text className="flex-1 text-lg font-bold text-zinc-950 dark:text-white">{choice.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Pressable
              onPress={completeChallenge}
              disabled={completed}
              accessibilityRole="button"
              accessibilityState={{ disabled: completed }}
              className={`min-h-16 items-center justify-center rounded-2xl px-5 ${completed ? "bg-emerald-700" : accent.button}`}
            >
              <Text className="text-center text-lg font-extrabold text-white">
                {completed ? "Completed — well done!" : "I completed this challenge"}
              </Text>
            </Pressable>
          )}
        </View>

        {answered && (
          <View accessibilityLiveRegion="polite" className="gap-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-5">
            <Text className="text-lg font-bold leading-relaxed text-emerald-950">{round.successMessage}</Text>
            <Pressable accessibilityRole="button" onPress={next} className="min-h-16 flex-row items-center justify-center gap-3 rounded-2xl bg-teal-700 px-6">
              <Text className="text-lg font-extrabold text-white">{isLast ? "Play again" : "Next round"}</Text>
              <ArrowRight size={22} color="white" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
