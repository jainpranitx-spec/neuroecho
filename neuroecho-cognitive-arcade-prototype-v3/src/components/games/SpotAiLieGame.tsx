"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Mic,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  PlusCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SPOT_LIE_STORIES } from "@/lib/gameData";
import { StoryLieItem } from "@/lib/types";
import { speakText, stopSpeech, speakFeedback } from "@/lib/speech";

export default function SpotAiLieGame() {
  const [stories, setStories] = useState<StoryLieItem[]>(SPOT_LIE_STORIES);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const story = stories[currentStoryIndex] || stories[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [speechRate, setSpeechRate] = useState(0.85); // Gentle speed for senior clarity

  // Result state
  const [buzzedSentenceIndex, setBuzzedSentenceIndex] = useState<number | null>(null);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  // Custom AI story generation prompt state
  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingAiStory, setIsGeneratingAiStory] = useState(false);

  const speechControllerRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const startPlayback = () => {
    stopSpeech();
    setIsPlaying(true);
    setHasBuzzed(false);
    setIsCorrect(null);
    setBuzzedSentenceIndex(null);
    setActiveSentenceIndex(0);

    const fullText = story.sentences.join(" ");

    speechControllerRef.current = speakText(
      fullText,
      speechRate,
      (sentenceIdx) => {
        setActiveSentenceIndex(sentenceIdx);
      },
      () => {
        setIsPlaying(false);
      }
    );
  };

  const pausePlayback = () => {
    stopSpeech();
    setIsPlaying(false);
  };

  const handleBuzzerPress = () => {
    stopSpeech();
    setIsPlaying(false);

    const targetedIdx = activeSentenceIndex >= 0 ? activeSentenceIndex : 0;
    setBuzzedSentenceIndex(targetedIdx);
    setHasBuzzed(true);

    const correct = targetedIdx === story.lieSentenceIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      speakFeedback("Spot on! You caught the AI lie!", 0.95);

      // Save session result
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "spot-ai-lie",
          score: 100,
          maxScore: 100,
          accuracyPercentage: 100,
          durationSeconds: 15,
          details: {
            storyTitle: story.title,
            topic: story.topic,
            summary: "Successfully detected AI inaccuracy"
          }
        })
      }).catch(e => console.log("Session save error:", e));

    } else {
      speakFeedback("Good try! The lie was actually in a different sentence. Check the explanation below.", 0.9);
      
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "spot-ai-lie",
          score: 40,
          maxScore: 100,
          accuracyPercentage: 40,
          durationSeconds: 20,
          details: {
            storyTitle: story.title,
            topic: story.topic,
            summary: "Missed exact lie sentence"
          }
        })
      }).catch(e => console.log("Session save error:", e));
    }
  };

  const handleGenerateCustomStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setIsGeneratingAiStory(true);
    stopSpeech();

    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: customTopic })
      });
      const newStory: StoryLieItem = await res.json();
      newStory.id = `ai-custom-${Date.now()}`;
      setStories((prev) => [newStory, ...prev]);
      setCurrentStoryIndex(0);
      setCustomTopic("");
      setHasBuzzed(false);
      setIsCorrect(null);
      speakFeedback(`New story generated about ${newStory.topic}! Tap play to listen.`);
    } catch (err) {
      console.log("Error generating story:", err);
    } finally {
      setIsGeneratingAiStory(false);
    }
  };

  const handleNextStory = () => {
    stopSpeech();
    setIsPlaying(false);
    setHasBuzzed(false);
    setIsCorrect(null);
    setActiveSentenceIndex(-1);
    setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
  };

  return (
    <div className="space-y-8">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-200 dark:border-amber-900">
              Module 1 &bull; Memory Auditor
            </span>
            <span className="text-xs font-medium text-zinc-400">Auditory Processing</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            Spot the AI Lie
          </h1>
          <p className="text-zinc-500 text-base mt-1">
            Listen closely to the audio story. Tap the primary buzzer button as soon as you detect a detail that is false or anachronistic.
          </p>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>{score} Points</span>
          </div>
        </div>
      </div>

      {/* Story Topic Selector */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Select Story Topic
        </div>
        <div className="flex flex-wrap gap-2">
          {stories.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                stopSpeech();
                setIsPlaying(false);
                setHasBuzzed(false);
                setIsCorrect(null);
                setActiveSentenceIndex(-1);
                setCurrentStoryIndex(idx);
              }}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${
                currentStoryIndex === idx
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
              }`}
            >
              {st.title}
            </button>
          ))}
        </div>
      </div>

      {/* Story Audio Stage Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              {story.topic} {story.decade ? `(${story.decade})` : ""}
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {story.title}
            </h2>
          </div>

          {/* Audio Waveform Bar Indicator */}
          <div className="flex items-center gap-1.5 h-10 px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <div className={`w-1.5 bg-amber-500 rounded-full ${isPlaying ? "animate-waveform-1" : "h-3"}`} />
            <div className={`w-1.5 bg-amber-500 rounded-full ${isPlaying ? "animate-waveform-2" : "h-5"}`} />
            <div className={`w-1.5 bg-amber-500 rounded-full ${isPlaying ? "animate-waveform-3" : "h-2"}`} />
            <div className={`w-1.5 bg-amber-500 rounded-full ${isPlaying ? "animate-waveform-4" : "h-6"}`} />
            <div className={`w-1.5 bg-amber-500 rounded-full ${isPlaying ? "animate-waveform-5" : "h-4"}`} />
            <span className="text-xs font-semibold text-zinc-500 ml-2">
              {isPlaying ? "Voice Reading..." : "Audio Ready"}
            </span>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!isPlaying ? (
              <button
                onClick={startPlayback}
                className="tremor-button px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base flex items-center gap-2.5 shadow-sm"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play Audio Story</span>
              </button>
            ) : (
              <button
                onClick={pausePlayback}
                className="tremor-button px-6 py-3.5 rounded-2xl bg-zinc-800 text-white font-bold text-base flex items-center gap-2.5"
              >
                <VolumeX className="w-5 h-5" />
                <span>Pause Voice</span>
              </button>
            )}

            <button
              onClick={() => {
                stopSpeech();
                setIsPlaying(false);
                setHasBuzzed(false);
                setIsCorrect(null);
                setActiveSentenceIndex(-1);
              }}
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
              title="Reset Audio"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Speech Rate Adjustment for Seniors */}
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <span>Voice Speed:</span>
            <button
              onClick={() => setSpeechRate(0.75)}
              className={`px-3 py-1.5 rounded-xl border ${
                speechRate === 0.75 ? "bg-amber-500 text-white border-amber-500" : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              Slow 0.75x
            </button>
            <button
              onClick={() => setSpeechRate(0.85)}
              className={`px-3 py-1.5 rounded-xl border ${
                speechRate === 0.85 ? "bg-amber-500 text-white border-amber-500" : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              Gentle 0.85x
            </button>
            <button
              onClick={() => setSpeechRate(1.0)}
              className={`px-3 py-1.5 rounded-xl border ${
                speechRate === 1.0 ? "bg-amber-500 text-white border-amber-500" : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              Normal 1.0x
            </button>
          </div>
        </div>

        {/* Sentences Transcript Box with Live Highlighting */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Live Story Transcript
          </div>
          <div className="text-xl leading-relaxed text-zinc-800 dark:text-zinc-200 font-sans space-y-2">
            {story.sentences.map((sent, idx) => {
              const isActive = activeSentenceIndex === idx;
              const isLieSentence = idx === story.lieSentenceIndex;
              const isBuzzedTarget = buzzedSentenceIndex === idx;

              return (
                <span
                  key={idx}
                  onClick={() => {
                    setActiveSentenceIndex(idx);
                    if (isPlaying) {
                      handleBuzzerPress();
                    }
                  }}
                  className={`cursor-pointer inline-block mr-2 px-2 py-1 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-amber-500/20 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500 font-semibold"
                      : hasBuzzed && isLieSentence
                      ? "bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-500"
                      : hasBuzzed && isBuzzedTarget && !isCorrect
                      ? "bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-500"
                      : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {sent}{" "}
                </span>
              );
            })}
          </div>
        </div>

        {/* GIANT TREMOR-PROOF PERPLEXITY BUZZER BUTTON */}
        <div className="pt-2">
          <button
            onClick={handleBuzzerPress}
            disabled={hasBuzzed}
            className={`tremor-button w-full py-6 px-8 rounded-3xl font-black text-2xl tracking-wide uppercase shadow-lg flex items-center justify-center gap-4 transition-all ${
              hasBuzzed
                ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                : isPlaying
                ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white zen-glow"
                : "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white"
            }`}
          >
            <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
            <span>WAIT, THAT&apos;S WRONG!</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK RESULT MODAL & HISTORICAL TRIVIA */}
      <AnimatePresence>
        {hasBuzzed && (
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
                    {isCorrect ? "Spot On! Excellent Ear!" : "Close Attempt!"}
                  </h3>
                  <p className="text-base font-medium opacity-80">
                    {isCorrect
                      ? "You correctly caught the AI lie sentence in the audio story!"
                      : "The AI lie was in sentence #" + (story.lieSentenceIndex + 1) + "."}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs uppercase font-bold text-zinc-400">Score</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  +{isCorrect ? 100 : 40} XP
                </div>
              </div>
            </div>

            {/* Explanation Breakdown */}
            <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3 text-zinc-800 dark:text-zinc-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Lightbulb className="w-4 h-4" /> Cognitive Memory Breakdown
              </div>
              <p className="text-lg font-medium leading-relaxed">
                {story.explanation}
              </p>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Historical Fun Fact:</strong> {story.funFact}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={startPlayback}
                className="px-6 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Listen Again
              </button>

              <button
                onClick={handleNextStory}
                className="tremor-button px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg flex items-center gap-3 shadow-md"
              >
                <span>Next Story</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GENERATE CUSTOM AI STORY FORM */}
      <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Generate a Custom AI Memory Story</span>
        </div>
        <p className="text-xs text-zinc-500">
          Type any personal topic (e.g. &quot;Gardening in 1965&quot;, &quot;Classic Cars&quot;, &quot;Baking Bread&quot;) and NeuroEcho AI will write a fresh story with a hidden lie for you!
        </p>

        <form onSubmit={handleGenerateCustomStory} className="flex gap-3">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g. Vintage Automobiles in Detroit"
            className="flex-1 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={isGeneratingAiStory}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all disabled:opacity-50 shrink-0 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isGeneratingAiStory ? "Writing Story..." : "Generate Story"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
