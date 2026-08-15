import * as Speech from "expo-speech";

export interface SpeechState {
  isPlaying: boolean;
  currentSentenceIndex: number;
  rate: number;
}

export type SpeechLanguage = "en-US" | "hi-IN";

// The OS default voice sounds noticeably robotic. Both iOS and Android ship
// higher-quality "Enhanced" voices too — expo-speech just doesn't pick one
// by default. We look them up once per language and reuse the best voice we
// find for every utterance in the app, at no extra cost or added dependency.
const bestVoicePromises = new Map<SpeechLanguage, Promise<string | undefined>>();

// Set once from the user's language preference (LanguageContext) so every
// speakText/speakFeedback call elsewhere in the app doesn't need to thread
// the language through every call site.
let activeLanguage: SpeechLanguage = "en-US";
let feedbackEnabled = true;

export function setVoiceFeedbackEnabled(enabled: boolean) {
  feedbackEnabled = enabled;
  if (!enabled) Speech.stop();
}

export function setSpeechLanguage(language: SpeechLanguage) {
  activeLanguage = language;
}

function getBestVoiceId(language: SpeechLanguage): Promise<string | undefined> {
  if (!bestVoicePromises.has(language)) {
    const langPrefix = language.split("-")[0].toLowerCase();
    const promise = Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const matching = voices.filter((v) => v.language?.toLowerCase().startsWith(langPrefix));
        const pool = matching.length > 0 ? matching : voices;

        const enhanced = pool.filter((v) => v.quality === Speech.VoiceQuality.Enhanced);
        const preferredRegion = enhanced.filter((v) => v.language?.toLowerCase() === language.toLowerCase());

        const best = preferredRegion[0] ?? enhanced[0] ?? pool[0];
        return best?.identifier;
      })
      .catch((err) => {
        console.warn(`[speech] failed to look up ${language} voices, using device default`, err);
        return undefined;
      });
    bestVoicePromises.set(language, promise);
  }
  return bestVoicePromises.get(language)!;
}

/**
 * Speaks `text` one sentence at a time (matching the original web
 * implementation), firing `onSentenceBoundary` before each sentence starts
 * so callers can highlight the active sentence in a transcript.
 */
export function speakText(
  text: string,
  rate: number = 0.9,
  onSentenceBoundary?: (sentenceIndex: number) => void,
  onEnd?: () => void
): { cancel: () => void } {
  const sentences = text.match(/[^.!?।]+[.!?।]+/g) || [text];
  let currentIdx = 0;
  let cancelled = false;

  const speakNextSentence = async () => {
    if (cancelled) return;
    if (currentIdx >= sentences.length) {
      onEnd?.();
      return;
    }

    const sentence = sentences[currentIdx].trim();
    if (!sentence) {
      currentIdx++;
      speakNextSentence();
      return;
    }

    onSentenceBoundary?.(currentIdx);
    const voice = await getBestVoiceId(activeLanguage);
    if (cancelled) return;

    Speech.speak(sentence, {
      rate,
      pitch: 1.0,
      language: activeLanguage,
      voice,
      onDone: () => {
        currentIdx++;
        speakNextSentence();
      },
      onError: () => {
        currentIdx++;
        speakNextSentence();
      },
    });
  };

  speakNextSentence();

  return {
    cancel: () => {
      cancelled = true;
      Speech.stop();
    },
  };
}

export function stopSpeech() {
  Speech.stop();
}

export async function speakFeedback(text: string, rate: number = 0.95) {
  if (!feedbackEnabled) return;
  Speech.stop();
  const voice = await getBestVoiceId(activeLanguage);
  Speech.speak(text, { rate, pitch: 1.0, language: activeLanguage, voice });
}
