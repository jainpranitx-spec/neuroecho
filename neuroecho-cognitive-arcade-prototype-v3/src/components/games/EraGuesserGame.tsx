"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Eye,
  RotateCcw,
  Smartphone,
  Radio,
  Tv,
  Gamepad
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ERA_GUESSER_ITEMS } from "@/lib/gameData";
import { speakFeedback } from "@/lib/speech";

export default function EraGuesserGame() {
  const [items, setItems] = useState(ERA_GUESSER_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = items[currentIndex];

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const handleSelectOption = (index: number) => {
    if (hasGuessed) return;

    setSelectedOptionIndex(index);
    setHasGuessed(true);

    const option = currentItem.options[index];
    const correct = option.isCorrect;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      speakFeedback("Spot on! You found the anachronistic item!");

      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "era-guesser",
          score: 100,
          maxScore: 100,
          accuracyPercentage: 100,
          durationSeconds: 12,
          details: {
            title: currentItem.title,
            decade: currentItem.trueDecade,
            summary: "Correctly identified anachronism"
          }
        })
      }).catch(e => console.log("Session error:", e));
    } else {
      speakFeedback("Nice try! Review the historical context below.");

      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "era-guesser",
          score: 40,
          maxScore: 100,
          accuracyPercentage: 40,
          durationSeconds: 15,
          details: {
            title: currentItem.title,
            decade: currentItem.trueDecade,
            summary: "Incorrect guess"
          }
        })
      }).catch(e => console.log("Session error:", e));
    }
  };

  const handleNextItem = () => {
    setHasGuessed(false);
    setSelectedOptionIndex(null);
    setIsCorrect(null);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  // Helper visual renderer for retro dioramas
  const renderRetroDiorama = (type: string) => {
    switch (type) {
      case "victorian_smartphone":
        return (
          <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-amber-950/80 to-amber-900/90 border border-amber-800/60 p-6 flex flex-col items-center justify-between text-amber-100 overflow-hidden shadow-inner">
            <div className="text-xs font-serif uppercase tracking-widest text-amber-300/80">
              1890s Victorian Parlor Scene
            </div>

            <div className="flex items-center justify-center gap-8 my-auto">
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-2xl bg-amber-800/80 border border-amber-600 flex items-center justify-center text-amber-200">
                  <Radio className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-serif">Antique Gramophone</span>
              </div>

              {/* Anachronism highlight */}
              <div className="text-center space-y-1 relative">
                <div className="w-16 h-20 rounded-2xl bg-zinc-900 border-2 border-teal-400 flex flex-col items-center justify-center text-teal-300 shadow-lg zen-glow">
                  <Smartphone className="w-8 h-8" />
                  <span className="text-[9px] font-mono mt-1">iOS 18</span>
                </div>
                <span className="text-[11px] font-bold text-teal-300">Modern Smartphone</span>
              </div>

              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-2xl bg-amber-800/80 border border-amber-600 flex items-center justify-center text-amber-200">
                  <Tv className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-serif">Silver Tea Set</span>
              </div>
            </div>

            <div className="text-center text-xs text-amber-300/70 italic">
              &quot;An elegant velvet tea table set with fine silver... and an unexpected glass device!&quot;
            </div>
          </div>
        );

      case "diner_bluetooth":
        return (
          <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-red-950/80 to-zinc-900 border border-red-900/60 p-6 flex flex-col items-center justify-between text-red-100 overflow-hidden shadow-inner">
            <div className="text-xs uppercase tracking-widest text-red-300">
              1950s American Diner Counter
            </div>

            <div className="flex items-center justify-center gap-8 my-auto">
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-full bg-red-800 border-2 border-amber-400 flex items-center justify-center text-amber-300">
                  🥤
                </div>
                <span className="text-[11px]">Cherry Milkshake</span>
              </div>

              {/* Anachronism */}
              <div className="text-center space-y-1 relative">
                <div className="w-16 h-20 rounded-full bg-teal-950 border-2 border-teal-400 flex flex-col items-center justify-center text-teal-300 shadow-lg zen-glow">
                  <Radio className="w-8 h-8 animate-pulse" />
                  <span className="text-[9px] font-mono mt-1">BT 5.3</span>
                </div>
                <span className="text-[11px] font-bold text-teal-300">Wireless BT Speaker</span>
              </div>

              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-200">
                  🎷
                </div>
                <span className="text-[11px]">Jukebox Vinyl</span>
              </div>
            </div>

            <div className="text-center text-xs text-red-300/80 italic">
              &quot;Chrome diner counter with red vinyl stool seats and a modern wireless speaker!&quot;
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-teal-950 to-zinc-900 border border-teal-900/60 p-6 flex flex-col items-center justify-between text-teal-100 overflow-hidden shadow-inner">
            <div className="text-xs uppercase tracking-widest text-teal-300">
              Historical Scene Preview
            </div>

            <div className="flex items-center justify-center gap-8 my-auto">
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-2xl bg-teal-900 border border-teal-700 flex items-center justify-center text-teal-200">
                  <Gamepad className="w-8 h-8" />
                </div>
                <span className="text-[11px]">Arcade Cabinet</span>
              </div>

              <div className="text-center space-y-1">
                <div className="w-16 h-20 rounded-2xl bg-zinc-950 border-2 border-teal-400 flex items-center justify-center text-teal-300 zen-glow">
                  📱
                </div>
                <span className="text-[11px] font-bold text-teal-300">Modern Tablet</span>
              </div>
            </div>

            <div className="text-center text-xs text-teal-300/80 italic">
              {currentItem.visualDescription}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-900">
              Module 2 &bull; Visual Recall
            </span>
            <span className="text-xs font-medium text-zinc-400">Semantic Memory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            Era Guesser
          </h1>
          <p className="text-zinc-500 text-base mt-1">
            Examine the historical scene diorama below. Identify the single item that does NOT belong in that decade.
          </p>
        </div>

        {/* Score Badge */}
        <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-500" />
          <span>{score} Points</span>
        </div>
      </div>

      {/* Main Scene Display */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Scene {currentIndex + 1} of {items.length} &bull; {currentItem.trueDecade}
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {currentItem.title}
            </h2>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            High-Contrast Imagery
          </span>
        </div>

        {/* Diorama Container */}
        {renderRetroDiorama(currentItem.imageType)}

        {/* Prompt Instruction */}
        <div className="text-center pt-2">
          <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
            Which item is anachronistic and doesn&apos;t belong in the {currentItem.trueDecade}?
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Tap your guess below (massive tremor-proof options)
          </p>
        </div>

        {/* 3 Massive Pill Options */}
        <div className="grid grid-cols-1 gap-4 pt-2">
          {currentItem.options.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const isTargetCorrect = opt.isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={hasGuessed}
                className={`tremor-button w-full px-8 py-5 rounded-2xl border text-left text-xl font-bold flex items-center justify-between transition-all ${
                  hasGuessed && isTargetCorrect
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-950 dark:text-emerald-100"
                    : hasGuessed && isSelected && !isTargetCorrect
                    ? "bg-rose-500/20 border-rose-500 text-rose-950 dark:text-rose-100"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30"
                }`}
              >
                <span>{opt.label}</span>
                {hasGuessed && isTargetCorrect && (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                )}
                {hasGuessed && isSelected && !isTargetCorrect && (
                  <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK & HISTORICAL CONTEXT MODAL */}
      <AnimatePresence>
        {hasGuessed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`rounded-3xl border p-8 shadow-lg space-y-6 ${
              isCorrect
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100"
                : "bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl text-white ${
                    isCorrect ? "bg-emerald-600" : "bg-amber-600"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {isCorrect ? "Correct Identification!" : "Historical Insight"}
                  </h3>
                  <p className="text-base font-medium opacity-80">
                    Anachronism: <strong>{currentItem.anachronismItem}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs uppercase font-bold text-zinc-400">Score</span>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  +{isCorrect ? 100 : 40} XP
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3 text-zinc-800 dark:text-zinc-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Lightbulb className="w-4 h-4" /> Historical Recall Detail
              </div>
              <p className="text-lg font-medium leading-relaxed">
                {currentItem.correctExplanation}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextItem}
                className="tremor-button px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg flex items-center gap-3 shadow-md"
              >
                <span>Next Era Scene</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
