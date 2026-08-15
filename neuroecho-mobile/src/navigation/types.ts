import { NavigatorScreenParams } from "@react-navigation/native";

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
  GeneratedGame: { gameId: string; title: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
