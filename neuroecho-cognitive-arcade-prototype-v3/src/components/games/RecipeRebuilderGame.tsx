"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  ListOrdered,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RotateCcw,
  Utensils,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RECIPE_ITEMS } from "@/lib/gameData";
import { RecipeItem } from "@/lib/types";
import { speakFeedback } from "@/lib/speech";

export default function RecipeRebuilderGame() {
  const [recipes] = useState<RecipeItem[]>(RECIPE_ITEMS);
  const [currentRecipeIdx, setCurrentRecipeIdx] = useState(0);
  const currentRecipe = recipes[currentRecipeIdx];

  // Steps state
  const [steps, setSteps] = useState(currentRecipe.scrambledSteps);
  const [hasVerified, setHasVerified] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [incorrectIndexes, setIncorrectIndexes] = useState<number[]>([]);

  // Move step up or down (Tremor-Friendly alternative to drag and drop)
  const moveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= steps.length || hasVerified) return;
    const newSteps = [...steps];
    const [moved] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, moved);
    setSteps(newSteps);
  };

  const handleVerifySequence = () => {
    setHasVerified(true);

    const wrongSteps: number[] = [];
    steps.forEach((step, idx) => {
      if (step.correctIndex !== idx) {
        wrongSteps.push(idx);
      }
    });

    setIncorrectIndexes(wrongSteps);

    const correct = wrongSteps.length === 0;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
      speakFeedback("Perfect sequence! Delicious execution!");

      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "recipe-rebuilder",
          score: 100,
          maxScore: 100,
          accuracyPercentage: 100,
          durationSeconds: 25,
          details: {
            recipeTitle: currentRecipe.title,
            summary: "Successfully rebuilt 5-step recipe sequence"
          }
        })
      }).catch(e => console.log("Session save error:", e));

    } else {
      speakFeedback("Almost there! Review the steps highlighted in red.");

      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "recipe-rebuilder",
          score: Math.max(20, 100 - wrongSteps.length * 20),
          maxScore: 100,
          accuracyPercentage: Math.max(20, 100 - wrongSteps.length * 20),
          durationSeconds: 30,
          details: {
            recipeTitle: currentRecipe.title,
            summary: `Misplaced ${wrongSteps.length} steps`
          }
        })
      }).catch(e => console.log("Session save error:", e));
    }
  };

  const handleNextRecipe = () => {
    const nextIdx = (currentRecipeIdx + 1) % recipes.length;
    setCurrentRecipeIdx(nextIdx);
    setSteps(recipes[nextIdx].scrambledSteps);
    setHasVerified(false);
    setIsCorrect(null);
    setIncorrectIndexes([]);
  };

  return (
    <div className="space-y-8">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-900">
              Module 3 &bull; Logical Sequencing
            </span>
            <span className="text-xs font-medium text-zinc-400">Executive Functioning</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            Recipe Rebuilder
          </h1>
          <p className="text-zinc-500 text-base mt-1">
            Reorder the 5 scrambled culinary steps into their proper chronological sequence. Use the up/down tap buttons or drag the cards.
          </p>
        </div>

        {/* Score Badge */}
        <div className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-500" />
          <span>{score} Points</span>
        </div>
      </div>

      {/* Main Recipe Stage Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                {currentRecipe.category} &bull; {currentRecipe.estimatedTime}
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {currentRecipe.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              setSteps([...currentRecipe.scrambledSteps].sort(() => Math.random() - 0.5));
              setHasVerified(false);
              setIsCorrect(null);
            }}
            className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
            title="Reshuffle Steps"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Scrambled Steps Interactive Cards List */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isMisplaced = hasVerified && incorrectIndexes.includes(idx);
            const isVerifiedCorrect = hasVerified && !incorrectIndexes.includes(idx);

            return (
              <motion.div
                key={step.id}
                layout
                className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isVerifiedCorrect
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100"
                    : isMisplaced
                    ? "bg-rose-500/10 border-rose-500 text-rose-950 dark:text-rose-100"
                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Step Number Badge */}
                  <div className="w-10 h-10 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-extrabold text-lg flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <p className="text-lg font-semibold leading-snug">
                      {step.text}
                    </p>
                    {step.tip && (
                      <span className="text-xs text-zinc-400 font-medium italic">
                        Tip: {step.tip}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tremor-Proof Arrow Reordering Taps */}
                {!hasVerified && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveStep(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                      title="Move Step Up"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => moveStep(idx, idx + 1)}
                      disabled={idx === steps.length - 1}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                      title="Move Step Down"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* GIANT PRIMARY VERIFY SEQUENCE BUTTON */}
        {!hasVerified && (
          <div className="pt-2">
            <button
              onClick={handleVerifySequence}
              className="tremor-button w-full py-6 px-8 rounded-3xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-2xl tracking-wide uppercase shadow-lg flex items-center justify-center gap-3 zen-glow-emerald"
            >
              <CheckCircle2 className="w-8 h-8" />
              <span>VERIFY RECIPE SEQUENCE</span>
            </button>
          </div>
        )}
      </div>

      {/* FEEDBACK MODAL */}
      <AnimatePresence>
        {hasVerified && (
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
                    {isCorrect ? "Perfect Culinary Order!" : "Sequence Needs Adjustment"}
                  </h3>
                  <p className="text-base font-medium opacity-80">
                    {isCorrect
                      ? "All 5 steps are in perfect chronological baking order!"
                      : `${incorrectIndexes.length} step(s) were misplaced in the sequence.`}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs uppercase font-bold text-zinc-400">Score</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  +{isCorrect ? 100 : Math.max(20, 100 - incorrectIndexes.length * 20)} XP
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setHasVerified(false)}
                className="px-6 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Try Adjusting Steps
              </button>

              <button
                onClick={handleNextRecipe}
                className="tremor-button px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg flex items-center gap-3 shadow-md"
              >
                <span>Next Recipe</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
