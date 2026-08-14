import React, { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { AlertTriangle, RotateCcw } from "lucide-react-native";

interface Props {
  children: ReactNode;
  /** Optional label shown in the fallback so you know which part of the
   * app crashed (e.g. "Spot the AI Lie") — helpful for reports without
   * needing a crash-reporting service wired up. */
  label?: string;
}

interface State {
  error: Error | null;
}

/**
 * React only lets error boundaries be class components (no hook
 * equivalent) — this is why it's a class, not a mismatch with the rest
 * of the app.
 *
 * Without this, a single render-time exception anywhere below it (e.g. a
 * malformed API response, a null the game logic didn't expect) unmounts
 * the whole tree and the app appears to "hang" — matching the
 * unresponsive-buttons symptom, since there's nothing left to press.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center gap-4 bg-zinc-50 p-8">
          <View className="rounded-2xl bg-rose-100 p-4">
            <AlertTriangle size={32} color="#e11d48" />
          </View>
          <Text className="text-center text-lg font-bold text-zinc-900">
            {this.props.label ? `${this.props.label} hit a snag` : "Something went wrong"}
          </Text>
          <Text className="text-center text-sm text-zinc-500">
            {this.state.error.message || "An unexpected error occurred."}
          </Text>
          <Pressable
            onPress={this.reset}
            className="mt-2 flex-row items-center gap-2 rounded-2xl bg-teal-600 px-6 py-3.5"
          >
            <RotateCcw size={18} color="white" />
            <Text className="text-base font-bold text-white">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
