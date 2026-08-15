import React from "react";
import { Pressable, Text, View } from "react-native";
import { Info, Volume2 } from "lucide-react-native";
import { speakFeedback } from "../lib/speech";

interface HowToPlayProps {
  steps: string[];
}

export default function HowToPlay({ steps }: HowToPlayProps) {
  const speakInstructions = () => {
    speakFeedback("How to play. " + steps.join(" "), 0.95);
  };

  return (
    <View className="gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Info size={16} color="#b45309" />
          <Text className="text-xs font-bold uppercase tracking-wide text-amber-700">How to Play</Text>
        </View>
        <Pressable
          onPress={speakInstructions}
          hitSlop={10}
          accessibilityLabel="Read instructions aloud"
          className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/40"
        >
          <Volume2 size={16} color="#b45309" />
        </Pressable>
      </View>
      <View className="gap-1">
        {steps.map((step, idx) => (
          <Text key={idx} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {idx + 1}. {step}
          </Text>
        ))}
      </View>
    </View>
  );
}
