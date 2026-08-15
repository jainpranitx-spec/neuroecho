import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

const STORAGE_KEY = "neuroecho.requestedGameIds.v1";

export interface LocalGameRequest {
  id: string;
  prompt: string;
  requestedAt: string;
}

export async function getLocalGameRequests(): Promise<LocalGameRequest[]> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as LocalGameRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function requestNewGame(prompt: string): Promise<LocalGameRequest> {
  const result = await api.requestGame(prompt);
  const request = { id: result.id, prompt, requestedAt: new Date().toISOString() };
  const current = await getLocalGameRequests();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([request, ...current].slice(0, 20)));
  return request;
}
