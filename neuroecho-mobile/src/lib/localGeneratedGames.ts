import AsyncStorage from "@react-native-async-storage/async-storage";
import { GeneratedGameDefinition } from "./generatedGames";

// Games the user creates on the fly by voice, entirely on-device. Unlike
// the community GENERATED_GAMES manifest (which ships in the app bundle
// after a reviewed GitHub PR and is the same for every install), these
// never leave this device — no backend call, no shared repo, no other
// NeuroEcho user ever sees them.
const STORAGE_KEY = "neuroecho.localGeneratedGames.v1";
const MAX_STORED = 25;

export interface LocalGeneratedGame extends GeneratedGameDefinition {
  createdAt: string;
  sourcePrompt: string;
}

export async function getLocalGeneratedGames(): Promise<LocalGeneratedGame[]> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as LocalGeneratedGame[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveLocalGeneratedGame(
  game: GeneratedGameDefinition,
  sourcePrompt: string
): Promise<LocalGeneratedGame> {
  const entry: LocalGeneratedGame = { ...game, createdAt: new Date().toISOString(), sourcePrompt };
  const current = await getLocalGeneratedGames();
  const next = [entry, ...current.filter((g) => g.id !== entry.id)].slice(0, MAX_STORED);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return entry;
}

export async function getLocalGeneratedGame(id: string): Promise<LocalGeneratedGame | undefined> {
  const games = await getLocalGeneratedGames();
  return games.find((g) => g.id === id);
}

export async function deleteLocalGeneratedGame(id: string): Promise<void> {
  const current = await getLocalGeneratedGames();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter((g) => g.id !== id)));
}
