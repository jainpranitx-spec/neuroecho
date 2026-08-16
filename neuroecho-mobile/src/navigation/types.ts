import { NavigatorScreenParams } from "@react-navigation/native";
import { GeneratedGameDefinition } from "../lib/generatedGames";

export type MainTabParamList = {
  Hub: undefined;
  Analytics: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  SpotAiLie: undefined;
  EraGuesser: undefined;
  RecipeRebuilder: undefined;
  MotionMatch: undefined;
  // localDefinition lets a freshly-created game render immediately without
  // an extra async AsyncStorage read — it's already in memory right after
  // generation. Games opened from the Hub list (already-saved games) can
  // omit it and let GeneratedGameScreen look the id up instead.
  GeneratedGame: { gameId: string; title: string; localDefinition?: GeneratedGameDefinition };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
