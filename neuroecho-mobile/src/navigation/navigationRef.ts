import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "./types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const GAME_TO_SCREEN: Record<string, keyof RootStackParamList> = {
  "spot-ai-lie": "SpotAiLie",
  "era-guesser": "EraGuesser",
  "recipe-rebuilder": "RecipeRebuilder",
  "motion-match": "MotionMatch",
};

const SCREEN_TO_TAB: Record<string, "Hub" | "Analytics" | "Settings"> = {
  hub: "Hub",
  analytics: "Analytics",
  settings: "Settings",
};

export function navigateToGame(gameTarget: string): boolean {
  const screen = GAME_TO_SCREEN[gameTarget];
  if (!screen || !navigationRef.isReady()) return false;
  (navigationRef.navigate as (name: string) => void)(screen);
  return true;
}

export function navigateToTab(screenTarget: string): boolean {
  const tab = SCREEN_TO_TAB[screenTarget];
  if (!tab || !navigationRef.isReady()) return false;
  (navigationRef.navigate as (name: string, params?: object) => void)("Main", { screen: tab });
  return true;
}
