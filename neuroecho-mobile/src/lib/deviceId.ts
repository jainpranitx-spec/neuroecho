import AsyncStorage from "@react-native-async-storage/async-storage";

// A random id generated once and stored locally, just to group one
// device's feedback messages together server-side — not a real account.
const STORAGE_KEY = "neuroecho.deviceId.v1";

let cached: string | null = null;

function generateId(): string {
  const random = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  return `device-${Date.now().toString(36)}-${random}`;
}

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) {
    cached = stored;
    return stored;
  }
  const fresh = generateId();
  await AsyncStorage.setItem(STORAGE_KEY, fresh);
  cached = fresh;
  return fresh;
}
