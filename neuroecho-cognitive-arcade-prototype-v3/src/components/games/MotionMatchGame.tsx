"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Hand,
  Camera,
  CameraOff,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  Play,
  Pause,
  Sliders,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOTION_TARGETS } from "@/lib/gameData";
import { MotionTarget } from "@/lib/types";
import { speakFeedback } from "@/lib/speech";

export default function MotionMatchGame() {
  const [targetList] = useState<MotionTarget[]>(MOTION_TARGETS);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const currentTarget = targetList[currentTargetIndex];

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setStreakCombo] = useState(0);
  const [reactionTimeMs, setReactionTimeMs] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Webcam state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Feedback state
  const [lastActionResult, setLastActionResult] = useState<{
    correct: boolean;
    actionTaken: "left" | "right";
    targetLabel: string;
  } | null>(null);

  // Initialize webcam feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setHasCamera(true);
        }
      } else {
        setCameraError("Webcam not available on this device");
      }
    } catch (err) {
      console.log("Camera access error:", err);
      setCameraError("Camera permission denied. Dual-task simulator active!");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setHasCamera(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleStartGame = () => {
    setIsPlaying(true);
    setCurrentTargetIndex(0);
    setScore(0);
    setStreakCombo(0);
    setLastActionResult(null);
    startTimeRef.current = Date.now();
    startCamera();
    speakFeedback("Motion match started! Raise Left Hand for Fruit, Right Hand for Machine.");
  };

  const handleGestureAction = (actionTaken: "left" | "right") => {
    if (!isPlaying) return;

    const reactionTime = Date.now() - startTimeRef.current;
    setReactionTimeMs(reactionTime);

    const isCorrectAction = actionTaken === currentTarget.requiredAction;

    setLastActionResult({
      correct: isCorrectAction,
      actionTaken,
      targetLabel: currentTarget.label
    });

    if (isCorrectAction) {
      const addedXp = Math.max(50, 100 - Math.floor(reactionTime / 50));
      setScore((prev) => prev + addedXp);
      setStreakCombo((prev) => prev + 1);
      speakFeedback("Correct gesture!", 1.1);

      if (combo > 2) {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      }
    } else {
      setStreakCombo(0);
      speakFeedback("Incorrect hand raised! Fruit = Left, Machine = Right.", 1.0);
    }

    // Advance target
    const nextIdx = (currentTargetIndex + 1) % targetList.length;
    setCurrentTargetIndex(nextIdx);
    startTimeRef.current = Date.now();
  };

  const handleEndGame = () => {
    setIsPlaying(false);
    stopCamera();

    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "motion-match",
        score,
        maxScore: 500,
        accuracyPercentage: score > 300 ? 95 : 80,
        durationSeconds: 30,
        details: {
          summary: "Completed Dual-Task Motor Training Session",
          reactionTimeMs
        }
      })
    }).catch(e => console.log("Session error:", e));
  };

  return (
    <div className="space-y-8">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs border border-teal-200 dark:border-teal-900">
              Module 4 &bull; Dual-Task Training
            </span>
            <span className="text-xs font-medium text-zinc-400">Motor Coordination</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            Motion Match
          </h1>
          <p className="text-zinc-500 text-base mt-1">
            Dual-Task rule: <strong>Fruit = Raise Left Hand</strong> | <strong>Machine = Raise Right Hand</strong>.
          </p>
        </div>

        {/* Score & Combo Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-bold text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-500" />
            <span>{score} XP</span>
          </div>

          <div className="px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-sm">
            Streak: {combo}x
          </div>
        </div>
      </div>

      {/* DUAL-TASK RULE CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-500/10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0">
            👈
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Rule 1 &bull; Left Hand
            </div>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              FRUIT / FOOD 🍎🍌🍊
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-blue-300 dark:border-blue-800 bg-blue-500/10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0">
            👉
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Rule 2 &bull; Right Hand
            </div>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              MACHINE / TOOL 🚜⚙️🔨
            </div>
          </div>
        </div>
      </div>

      {/* WEBCAM STAGE CARD */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wide">
                Live Dual-Task Motion Feed
              </div>
              <h2 className="text-xl font-bold text-white">
                Gesture Target Stage
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handleStartGame}
                className="tremor-button px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base flex items-center gap-2 shadow-md"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Motion Match</span>
              </button>
            ) : (
              <button
                onClick={handleEndGame}
                className="px-5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm"
              >
                End Stage
              </button>
            )}
          </div>
        </div>

        {/* Video / Target Container */}
        <div className="relative w-full min-h-[320px] rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col items-center justify-between p-6">
          {/* Floating Target Badge Prompt */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTarget.id}
              initial={{ scale: 0.8, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10 }}
              className="z-10 p-6 rounded-3xl bg-zinc-900/90 border-2 border-teal-400/80 backdrop-blur-md shadow-2xl flex items-center gap-4 text-center max-w-sm zen-glow"
            >
              <span className="text-5xl">{currentTarget.emoji}</span>
              <div className="text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Target Object
                </span>
                <h3 className="text-2xl font-black text-white">
                  {currentTarget.label}
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Category: <strong className="uppercase text-amber-400">{currentTarget.category}</strong>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Hidden video element for live webcam feed */}
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover opacity-30 ${
              hasCamera ? "block" : "hidden"
            }`}
            playsInline
            muted
          />

          {/* Status Message overlay */}
          {!hasCamera && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-zinc-400 space-y-2">
              <CameraOff className="w-10 h-10 text-zinc-600 mb-2" />
              <p className="text-sm font-medium">
                {cameraError || "Press Start to enable camera motion feed or use simulated gesture pads below."}
              </p>
            </div>
          )}

          {/* Live Action Result Feedback Badge */}
          {lastActionResult && (
            <div className="z-10 mt-4 px-6 py-2.5 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center gap-2 text-sm font-bold">
              {lastActionResult.correct ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" /> Correct Gesture (+{reactionTimeMs ? Math.max(50, 100 - Math.floor(reactionTimeMs / 50)) : 100} XP)
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-5 h-5" /> Incorrect Hand Raised!
                </span>
              )}
            </div>
          )}
        </div>

        {/* SIMULATED DUAL-TASK GESTURE CONTROL PADS (TREMOR & ACCESSIBILITY FRIENDLY) */}
        <div className="space-y-3 pt-2">
          <div className="text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
            Raise Hand Gesture Control Pads (Dual-Task Action)
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleGestureAction("left")}
              disabled={!isPlaying}
              className="tremor-button py-6 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xl flex flex-col items-center justify-center gap-2 shadow-lg disabled:opacity-40 transition-all"
            >
              <span className="text-3xl">👈 🍎</span>
              <span>RAISE LEFT HAND</span>
              <span className="text-xs font-normal opacity-80">(Fruit / Food)</span>
            </button>

            <button
              onClick={() => handleGestureAction("right")}
              disabled={!isPlaying}
              className="tremor-button py-6 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-xl flex flex-col items-center justify-center gap-2 shadow-lg disabled:opacity-40 transition-all"
            >
              <span className="text-3xl">🚜 👉</span>
              <span>RAISE RIGHT HAND</span>
              <span className="text-xs font-normal opacity-80">(Machine / Tool)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
