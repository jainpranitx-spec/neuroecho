export interface SpeechState {
  isPlaying: boolean;
  currentSentenceIndex: number;
  rate: number;
}

export function speakText(
  text: string,
  rate: number = 0.9,
  onSentenceBoundary?: (sentenceIndex: number) => void,
  onEnd?: () => void
): { cancel: () => void } {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return { cancel: () => {} };
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentIdx = 0;

  const speakNextSentence = () => {
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

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick a natural clear voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("Alex"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      onSentenceBoundary?.(currentIdx);
    };

    utterance.onend = () => {
      currentIdx++;
      speakNextSentence();
    };

    utterance.onerror = () => {
      currentIdx++;
      speakNextSentence();
    };

    window.speechSynthesis.speak(utterance);
  };

  speakNextSentence();

  return {
    cancel: () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  };
}

export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakFeedback(text: string, rate: number = 0.95) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang.startsWith("en"));
  if (voice) utterance.voice = voice;
  
  window.speechSynthesis.speak(utterance);
}
