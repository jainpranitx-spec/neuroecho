import * as Speech from "expo-speech";

export interface SpeechState {
  isPlaying: boolean;
  currentSentenceIndex: number;
  rate: number;
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
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentIdx = 0;
  let cancelled = false;

  const speakNextSentence = () => {
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

    Speech.speak(sentence, {
      rate,
      pitch: 1.0,
      language: "en-US",
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

export function speakFeedback(text: string, rate: number = 0.95) {
  Speech.stop();
  Speech.speak(text, { rate, pitch: 1.0, language: "en-US" });
}
