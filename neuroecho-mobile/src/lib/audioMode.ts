import { setAudioModeAsync } from "expo-audio";

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
