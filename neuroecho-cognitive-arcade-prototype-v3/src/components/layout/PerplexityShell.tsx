"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  Mic,
  MicOff,
  Volume2,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  ListOrdered,
  Hand,
  BarChart2,
  Settings,
  Sun,
  Moon,
  ChevronRight,
  Flame,
  Award,
  X,
  HelpCircle,
  Type
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { speakText, stopSpeech } from "@/lib/speech";

interface PerplexityShellProps {
  children: React.ReactNode;
}

export default function PerplexityShell({ children }: PerplexityShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Accessibility State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeTextMode, setLargeTextMode] = useState(false);
  const [voiceAssistActive, setVoiceAssistActive] = useState(false);

  // Search / Ask AI Assistant Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ answer: string; sources: string[] } | null>(null);

  // Profile data state
  const [profile, setProfile] = useState<{
    name: string;
    totalXp: number;
    streakDays: number;
    difficultyLevel: string;
  }>({
    name: "Senior Explorer",
    totalXp: 420,
    streakDays: 3,
    difficultyLevel: "standard"
  });

  useEffect(() => {
    // Load profile
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.name) {
          setProfile(data);
          if (data.highContrast) setHighContrast(true);
        }
      })
      .catch((err) => console.log("Profile load error:", err));
  }, []);

  const handleAskAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setAiResponse(data);
      if (voiceAssistActive) {
        speakText(data.answer.replace(/[*#]/g, ""));
      }
    } catch (err) {
      setAiResponse({
        answer: "NeuroEcho AI is ready! Play games like Spot the AI Lie or Recipe Rebuilder to sharpen memory and sequencing.",
        sources: ["NeuroEcho Help"]
      });
    } finally {
      setAiLoading(false);
    }
  };

  const navItems = [
    {
      name: "Cognitive Hub",
      href: "/",
      icon: Brain,
      badge: "Home",
    },
    {
      name: "Spot the AI Lie",
      href: "/games/spot-ai-lie",
      icon: Mic,
      subtitle: "Memory Auditor",
      badge: "Audio",
    },
    {
      name: "Era Guesser",
      href: "/games/era-guesser",
      icon: Clock,
      subtitle: "Visual Recall",
      badge: "Visual",
    },
    {
      name: "Recipe Rebuilder",
      href: "/games/recipe-rebuilder",
      icon: ListOrdered,
      subtitle: "Logical Sequencing",
      badge: "Logic",
    },
    {
      name: "Motion Match",
      href: "/games/motion-match",
      icon: Hand,
      subtitle: "Dual-Task Motor",
      badge: "Webcam",
    },
    {
      name: "Cognitive Analytics",
      href: "/analytics",
      icon: BarChart2,
      badge: "Report",
    },
    {
      name: "Zen Settings",
      href: "/settings",
      icon: Settings,
      badge: "Accessibility",
    },
  ];

  const getBreadcrumbLabel = () => {
    const item = navItems.find((n) => n.href === pathname);
    return item ? item.name : "NeuroEcho Arcade";
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col md:flex-row ${
        isDarkMode
          ? "bg-zinc-950 text-zinc-100 dark"
          : highContrast
          ? "bg-black text-white"
          : "bg-zinc-50 text-zinc-900"
      } ${largeTextMode ? "text-lg" : "text-base"}`}
    >
      {/* LEFT NAVIGATION RAIL / SIDEBAR (PERPLEXITY STYLE) */}
      <aside
        className={`w-full md:w-72 md:min-h-screen border-r flex flex-col justify-between p-4 z-30 shrink-0 ${
          isDarkMode
            ? "border-zinc-800/80 bg-zinc-900/90"
            : highContrast
            ? "border-zinc-700 bg-zinc-950"
            : "border-zinc-200/80 bg-white/95"
        } backdrop-blur-sm`}
      >
        <div className="space-y-6">
          {/* Logo & Brand Header */}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight font-sans">
                  Neuro<span className="text-teal-600 dark:text-teal-400">Echo</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                  Zen AI
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                The Cognitive Arcade
              </p>
            </div>
          </Link>

          {/* User Quick Stats Pill */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDarkMode
                ? "bg-zinc-950/60 border-zinc-800"
                : "bg-zinc-50 border-zinc-200/80"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Flame className="w-5 h-5 fill-amber-500/20" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Streak
                </div>
                <div className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  {profile.streakDays} Days
                </div>
              </div>
            </div>

            <div className="h-7 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Points
                </div>
                <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  {profile.totalXp} XP
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <div className="px-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pb-1">
              Arcade Modules
            </div>

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal-600 text-white font-semibold shadow-sm shadow-teal-600/30"
                      : isDarkMode
                      ? "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                      : "text-zinc-700 hover:bg-zinc-200/60 hover:text-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 stroke-[1.5] ${
                        isActive ? "text-white" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    />
                    <div>
                      <div>{item.name}</div>
                      {item.subtitle && (
                        <div
                          className={`text-[11px] ${
                            isActive ? "text-teal-100" : "text-zinc-400 dark:text-zinc-500"
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-lg ${
                        isActive
                          ? "bg-teal-700/80 text-teal-50"
                          : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer - Elder Accessibility Toggles */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs text-zinc-500">
            <span>Elder Accessibility</span>
            <span className="font-semibold text-teal-600 dark:text-teal-400">ACTIVE</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Dark/Light Mode"
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs transition-all ${
                isDarkMode
                  ? "bg-zinc-800 border-zinc-700 text-amber-400"
                  : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-[10px] font-medium">{isDarkMode ? "Light" : "Dark"}</span>
            </button>

            <button
              onClick={() => setLargeTextMode(!largeTextMode)}
              title="Toggle Large Typography"
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs transition-all ${
                largeTextMode
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <Type className="w-4 h-4 stroke-[2]" />
              <span className="text-[10px] font-medium">{largeTextMode ? "XL Text" : "Text"}</span>
            </button>

            <button
              onClick={() => {
                const nextState = !voiceAssistActive;
                setVoiceAssistActive(nextState);
                if (nextState) speakText("Voice guidance activated.");
                else stopSpeech();
              }}
              title="Toggle Voice Reader"
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs transition-all ${
                voiceAssistActive
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {voiceAssistActive ? <Volume2 className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="text-[10px] font-medium">{voiceAssistActive ? "Voice On" : "Voice"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN STAGE STYLED WITH PERPLEXITY AESTHETIC */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header
          className={`sticky top-0 z-20 border-b px-6 py-4 flex items-center justify-between gap-4 backdrop-blur-md ${
            isDarkMode
              ? "bg-zinc-950/80 border-zinc-800/80"
              : highContrast
              ? "bg-black border-zinc-700"
              : "bg-zinc-50/90 border-zinc-200/80"
          }`}
        >
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href="/"
              className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors font-medium"
            >
              NeuroEcho
            </Link>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {getBreadcrumbLabel()}
            </span>
          </div>

          {/* Ask Perplexity AI Search Bar Input */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border text-sm transition-all ${
                isDarkMode
                  ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="truncate">Ask NeuroEcho AI (e.g., &quot;Give me a memory tip&quot;)</span>
              </div>
              <kbd className="hidden lg:inline-block text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border dark:border-zinc-700 text-zinc-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="sm:hidden p-2.5 rounded-xl bg-teal-600 text-white"
              aria-label="Open AI Assistant"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Guide</span>
            </button>
          </div>
        </header>

        {/* Main Stage Content Container */}
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">{children}</div>
        </div>

        {/* Footer */}
        <footer
          className={`border-t py-6 px-6 text-center text-xs text-zinc-400 dark:text-zinc-500 ${
            isDarkMode ? "border-zinc-900" : "border-zinc-200/80"
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>NeuroEcho &copy; 2026 — Designed for Senior Cognitive Plasticity & Tremor Accessibility</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> High-Contrast Compliant
              </span>
              <span>•</span>
              <span>Web Speech Enabled</span>
            </div>
          </div>
        </footer>
      </main>

      {/* PERPLEXITY AI MODAL */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 overflow-hidden ${
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">NeuroEcho AI Assistant</h3>
                    <p className="text-xs text-zinc-400">Ask cognitive questions or request a custom game topic</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAskAi} className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask anything (e.g., 'How to improve my focus?', 'Tell me a story about 1960s radios')"
                    className={`w-full px-5 py-4 text-lg rounded-2xl border transition-all focus:outline-none ${
                      isDarkMode
                        ? "bg-zinc-950 border-zinc-800 focus:border-teal-500"
                        : "bg-zinc-50 border-zinc-200 focus:border-teal-600"
                    }`}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="absolute right-3 top-3 bottom-3 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {aiLoading ? "Thinking..." : "Ask AI"}
                  </button>
                </div>
              </form>

              {/* AI Response Display */}
              {aiResponse && (
                <div className="mt-6 p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900 space-y-4 max-h-80 overflow-y-auto">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
                    <Brain className="w-4 h-4" /> Perplexity Cognitive Answer
                  </div>
                  <div className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line">
                    {aiResponse.answer}
                  </div>
                  {aiResponse.sources && aiResponse.sources.length > 0 && (
                    <div className="pt-2 border-t border-teal-200/40 dark:border-teal-900/40 flex items-center gap-2 text-xs text-zinc-400">
                      <span>Sources:</span>
                      {aiResponse.sources.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
