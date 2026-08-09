import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroEcho — The Cognitive Arcade",
  description: "Personalized AI cognitive games for older adults. Spot the AI Lie, Era Guesser, Recipe Rebuilder, and Motion Match with zen minimalism and elder accessibility.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans bg-zinc-50 text-zinc-900 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
