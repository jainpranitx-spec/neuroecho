"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mic,
  Clock,
  ListOrdered,
  Hand,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  ShieldAlert,
  Flame,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

export default function CognitiveHub() {
  const [analytics, setAnalytics] = useState<{
    overallIndex: number;
    scores: {
      memoryAudit: number;
      visualRecognition: number;
      logicalSequencing: number;
      motorCoordination: number;
    };
    aiRecommendation: string;
  }>({
    overallIndex: 88,
    scores: {
      memoryAudit: 88,
      visualRecognition: 92,
      logicalSequencing: 85,
      motorCoordination: 90,
    },
    aiRecommendation: "Great cognitive stability! Today is an optimal day for Dual-Task Motor training to enhance focus and coordination."
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.scores) {
          setAnalytics(data);
        }
      })
      .catch((e) => console.log("Analytics fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  const games = [
    {
      id: "spot-ai-lie",
      title: "1. Spot the AI Lie",
      subtitle: "Memory Auditor",
      description: "Listen to nostalgic short stories read aloud. Press the giant tremor-proof buzzer the second you hear an AI mistake!",
      href: "/games/spot-ai-lie",
      icon: Mic,
      color: "from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-900",
      accentText: "text-amber-600 dark:text-amber-400",
      badge: "Auditory Recall",
      scoreKey: "memoryAudit" as const,
      buttonText: "Launch Memory Auditor",
      hotkey: "1",
    },
    {
      id: "era-guesser",
      title: "2. Era Guesser",
      subtitle: "Visual Semantic Memory",
      description: "Examine detailed retro historical scenes. Identify the anachronistic item that doesn't belong in that decade.",
      href: "/games/era-guesser",
      icon: Clock,
      color: "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-900",
      accentText: "text-blue-600 dark:text-blue-400",
      badge: "Visual Recognition",
      scoreKey: "visualRecognition" as const,
      buttonText: "Launch Era Guesser",
      hotkey: "2",
    },
    {
      id: "recipe-rebuilder",
      title: "3. Recipe Rebuilder",
      subtitle: "Logical Sequencing",
      description: "Scrambled classic baking & soup recipes created by AI. Drag or tap to restore the correct chronological cooking sequence.",
      href: "/games/recipe-rebuilder",
      icon: ListOrdered,
      color: "from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-900",
      accentText: "text-emerald-600 dark:text-emerald-400",
      badge: "Executive Function",
      scoreKey: "logicalSequencing" as const,
      buttonText: "Launch Recipe Rebuilder",
      hotkey: "3",
    },
    {
      id: "motion-match",
      title: "4. Motion Match",
      subtitle: "Dual-Task Training",
      description: "Interactive webcam stage with dual-task prompts: Fruit = Raise Left Hand, Machine = Raise Right Hand.",
      href: "/games/motion-match",
      icon: Hand,
      color: "from-teal-500/10 to-teal-600/5 border-teal-200 dark:border-teal-900",
      accentText: "text-teal-600 dark:text-teal-400",
      badge: "Motor Coordination",
      scoreKey: "motorCoordination" as const,
      buttonText: "Launch Motion Stage",
      hotkey: "4",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner - Zen Minimalist Perplexity Style */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-200/80 dark:border-teal-800">
              <Sparkles className="w-3.5 h-3.5" /> Cognitive Health Hub &bull; Daily Session
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <span>Tremor Guard: Active</span>
              <span>&bull;</span>
              <span>Voice Feedback: Ready</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Welcome to NeuroEcho
          </h1>

          <p className="text-zinc-600 dark:text-zinc-300 text-lg max-w-2xl leading-relaxed">
            Personalized, calming cognitive workouts designed specifically for seniors. Choose a game below or follow today&apos;s AI recommendation.
          </p>

          {/* AI Recommendation Insight Bar */}
          <div className="mt-4 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0 mt-0.5">
              <Brain className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                AI Cognitive Insight Today
              </div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {analytics.aiRecommendation}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cognitive Score Cards Row */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            Cognitive Index
          </div>
          <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-2">
            {analytics.overallIndex}<span className="text-lg text-zinc-400">/100</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Optimal Mind Agility
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            Auditory Recall
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {analytics.scores.memoryAudit}%
          </div>
          <div className="text-xs text-zinc-400 font-medium mt-1">
            Spot the AI Lie
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            Visual Memory
          </div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {analytics.scores.visualRecognition}%
          </div>
          <div className="text-xs text-zinc-400 font-medium mt-1">
            Era Guesser
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            Motor Agility
          </div>
          <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-2">
            {analytics.scores.motorCoordination}%
          </div>
          <div className="text-xs text-zinc-400 font-medium mt-1">
            Motion Match
          </div>
        </div>
      </section>

      {/* Main Arcade Launcher Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Cognitive Arcade Games
            </h2>
            <p className="text-sm text-zinc-500">
              Sleek, tremor-proof modules designed for single-action focus
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            4 Games Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game, idx) => {
            const Icon = game.icon;
            const scoreVal = analytics.scores[game.scoreKey];

            return (
              <motion.div
                key={game.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                className={`rounded-2xl border p-6 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 ${game.accentText}`}>
                        <Icon className="w-7 h-7 stroke-[1.75]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {game.badge}
                        </span>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {game.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      Score: {scoreVal}%
                    </span>
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={game.href}
                    className="tremor-button w-full px-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all"
                  >
                    <span>{game.buttonText}</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Quick Senior Tips Bar */}
      <section className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Accessibility Notice
            </div>
            <p className="text-xs text-zinc-500">
              All buttons feature a minimum 64px hit height for tremor tolerance. Audio feedback can be paused anytime.
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all shrink-0"
        >
          Customize Settings
        </Link>
      </section>
    </div>
  );
}
