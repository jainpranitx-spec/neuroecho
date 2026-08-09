"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Volume2,
  Mic,
  ShieldCheck,
  Type,
  Sun,
  Moon,
  Check,
  Save,
  Sparkles,
  Sliders,
  CheckCircle2
} from "lucide-react";
import { speakFeedback } from "@/lib/speech";

export default function AccessibilitySettings() {
  const [profile, setProfile] = useState({
    name: "Senior Explorer",
    age: 72,
    difficultyLevel: "standard",
    speechRate: "0.85",
    tremorAssist: true,
    highContrast: false,
    voiceFeedbackEnabled: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.name) setProfile(data);
      })
      .catch((e) => console.log("Profile fetch error:", e));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setSavedSuccess(true);
        speakFeedback("Zen accessibility settings updated successfully.");
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.log("Error saving settings:", e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs border border-teal-200 dark:border-teal-900">
            Design System &bull; Zen Elder Accessibility
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
          Zen Settings & Tremor Adaptation
        </h1>
        <p className="text-zinc-500 text-base mt-1">
          Customize target padding, voice reading rate, high contrast, and game difficulty for maximum comfort.
        </p>
      </div>

      {/* Settings Options Form */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm space-y-8">
        {/* Tremor Assist Toggle */}
        <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-teal-600 text-white shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Tremor-Proof Target Guard
              </h3>
              <p className="text-sm text-zinc-500">
                Maintains massive button tap targets (min 64px height with 32px padding) and prevents accidental double taps.
              </p>
            </div>
          </div>

          <button
            onClick={() => setProfile({ ...profile, tremorAssist: !profile.tremorAssist })}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
              profile.tremorAssist
                ? "bg-teal-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {profile.tremorAssist ? "Active" : "Disabled"}
          </button>
        </div>

        {/* Speech Rate Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <Volume2 className="w-5 h-5 text-teal-600" />
            <span>Voice Synthesis Speech Pace</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { rate: "0.75", label: "Slow & Clear (0.75x)", desc: "For maximum auditory clarity" },
              { rate: "0.85", label: "Gentle Pace (0.85x)", desc: "Recommended senior default" },
              { rate: "1.0", label: "Standard Pace (1.0x)", desc: "Regular conversation speed" },
            ].map((item) => (
              <button
                key={item.rate}
                onClick={() => setProfile({ ...profile, speechRate: item.rate })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  profile.speechRate === item.rate
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                }`}
              >
                <div className="font-bold text-base">{item.label}</div>
                <div className={`text-xs mt-1 ${profile.speechRate === item.rate ? "text-teal-100" : "text-zinc-400"}`}>
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Difficulty Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <Sliders className="w-5 h-5 text-teal-600" />
            <span>Cognitive Difficulty Level</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { level: "gentle", label: "Gentle Zen", desc: "Longer audio pauses & simpler questions" },
              { level: "standard", label: "Standard Mind", desc: "Balanced cognitive exercise" },
              { level: "challenge", label: "Master Mind", desc: "Faster pace & subtle inaccuracies" },
            ].map((item) => (
              <button
                key={item.level}
                onClick={() => setProfile({ ...profile, difficultyLevel: item.level })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  profile.difficultyLevel === item.level
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                }`}
              >
                <div className="font-bold text-base">{item.label}</div>
                <div className={`text-xs mt-1 ${profile.difficultyLevel === item.level ? "text-teal-100" : "text-zinc-400"}`}>
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
          {savedSuccess ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" /> Settings Saved!
            </span>
          ) : (
            <span className="text-xs text-zinc-400">
              Changes take effect immediately across all arcade games.
            </span>
          )}

          <button
            onClick={handleSave}
            className="tremor-button px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg flex items-center gap-2.5 shadow-md"
          >
            <Save className="w-5 h-5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
