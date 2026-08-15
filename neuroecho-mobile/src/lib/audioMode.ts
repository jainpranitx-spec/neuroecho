import { AudioQuality, IOSOutputFormat, RecordingOptions, setAudioModeAsync } from "expo-audio";

// Gemini only needs clear speech, not music-quality audio — recording at
// HIGH_QUALITY (44.1kHz stereo, 128kbps) produces a file 6-8x larger than
// necessary, which was the main cause of Echo taking a long time to reply:
// most of the delay was uploading the recording, not Gemini "thinking".
// 16kHz mono at a modest bitrate is still plenty clear for transcription
// and shrinks the payload dramatically. Keeps .m4a/AAC on both platforms
// (rather than expo-audio's built-in LOW_QUALITY, which switches Android to
// .3gp/AMR — a different container Gemini can't reliably parse).
export const VOICE_RECORDING_OPTIONS: RecordingOptions = {
  extension: ".m4a",
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 32000,
  android: {
    outputFormat: "mpeg4",
    audioEncoder: "aac",
  },
  ios: {
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.MEDIUM,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 32000,
  },
};

// iOS routes audio to the earpiece (call-speaker) instead of the loudspeaker
// whenever the session category allows recording. We only need that category
// while actually capturing the user's voice, so we switch back to a
// playback-only category the instant recording stops — that's what makes
// iOS default to the loudspeaker again.
export async function setPlaybackAudioMode(routeThroughEarpiece = false) {
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
    shouldRouteThroughEarpiece: routeThroughEarpiece,
  });
}

export async function setRecordingAudioMode() {
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });
}
