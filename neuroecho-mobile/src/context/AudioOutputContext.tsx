import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setPlaybackAudioMode } from "../lib/audioMode";

export type AudioOutput = "loudspeaker" | "earpiece";

const STORAGE_KEY = "neuroecho.audioOutput";

interface AudioOutputContextValue {
  output: AudioOutput;
  setOutput: (output: AudioOutput) => void;
}

const AudioOutputContext = createContext<AudioOutputContextValue | null>(null);

export function AudioOutputProvider({ children }: { children: React.ReactNode }) {
  const [output, setOutputState] = useState<AudioOutput>("loudspeaker");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        const pref = (stored as AudioOutput | null) ?? "loudspeaker";
        setOutputState(pref);
        setPlaybackAudioMode(pref === "earpiece").catch(() => {});
      })
      .catch((err) => console.warn("[AudioOutputProvider] failed to load preference", err))
      .finally(() => setHydrated(true));
  }, []);

  const setOutput = (pref: AudioOutput) => {
    setOutputState(pref);
    setPlaybackAudioMode(pref === "earpiece").catch((err) =>
      console.warn("[AudioOutputProvider] failed to apply audio mode", err)
    );
    AsyncStorage.setItem(STORAGE_KEY, pref).catch((err) =>
      console.warn("[AudioOutputProvider] failed to persist preference", err)
    );
  };

  const value = useMemo(() => ({ output, setOutput }), [output]);

  if (!hydrated) return null;

  return <AudioOutputContext.Provider value={value}>{children}</AudioOutputContext.Provider>;
}

export function useAudioOutput() {
  const ctx = useContext(AudioOutputContext);
  if (!ctx) throw new Error("useAudioOutput must be used within AudioOutputProvider");
  return ctx;
}
