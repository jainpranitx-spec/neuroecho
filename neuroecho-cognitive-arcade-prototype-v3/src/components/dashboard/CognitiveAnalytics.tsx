"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart2,
  TrendingUp,
  Brain,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";

export default function CognitiveAnalytics() {
  const [data, setData] = useState<{
    overallIndex: number;
    scores: {
      memoryAudit: number;
      visualRecognition: number;
      logicalSequencing: number;
      motorCoordination: number;
    };
    totalSessionsCompleted: number;
    aiRecommendation: string;
    recentSessions: any[];
  }>({
    overallIndex: 88,
    scores: {
      memoryAudit: 88,
      visualRecognition: 92,
      logicalSequencing: 85,
      motorCoordination: 90,
    },
    totalSessionsCompleted: 14,
    aiRecommendation: "Excellent cognitive stamina! Your auditory recall and spatial sequencing show continuous improvement over the last 7 days.",
    recentSessions: []
  });

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((d) => {
        if (d && d.scores) setData(d);
      })
      .catch((e) => console.log("Analytics fetch error:", e));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs border border-teal-200 dark:border-teal-900">
              Cognitive Report &bull; Doctor & Caregiver View
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            Cognitive Analytics & Progress
          </h1>
          <p className="text-zinc-500 text-base mt-1">
            Comprehensive breakdown of memory recall, visual semantic processing, sequencing, and dual-task motor control.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print Caregiver Report
        </button>
      </div>

      {/* Main Composite Score Card */}
      <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Overall NeuroEcho Index
            </div>
            <div className="text-5xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {data.overallIndex} <span className="text-2xl font-semibold text-zinc-400">/ 100</span>
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 mt-1">
              <TrendingUp className="w-4 h-4" /> Top 12% for active cognitive stability in age bracket
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 max-w-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-700 dark:text-teal-300">
              <Brain className="w-4 h-4" /> AI Neural Summary
            </div>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {data.aiRecommendation}
            </p>
          </div>
        </div>

        {/* 4 Skill Area Progress Bars */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Cognitive Domain Breakdown
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span className="text-zinc-800 dark:text-zinc-200">1. Spot the AI Lie (Auditory Memory)</span>
                <span className="text-amber-600 font-extrabold">{data.scores.memoryAudit}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${data.scores.memoryAudit}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span className="text-zinc-800 dark:text-zinc-200">2. Era Guesser (Visual Semantic)</span>
                <span className="text-blue-600 font-extrabold">{data.scores.visualRecognition}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.scores.visualRecognition}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span className="text-zinc-800 dark:text-zinc-200">3. Recipe Rebuilder (Executive Sequencing)</span>
                <span className="text-emerald-600 font-extrabold">{data.scores.logicalSequencing}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.scores.logicalSequencing}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span className="text-zinc-800 dark:text-zinc-200">4. Motion Match (Dual-Task Motor)</span>
                <span className="text-teal-600 font-extrabold">{data.scores.motorCoordination}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: `${data.scores.motorCoordination}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
