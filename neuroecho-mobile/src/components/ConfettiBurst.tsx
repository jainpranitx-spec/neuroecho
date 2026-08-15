import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
// @ts-ignore -- package ships its own .d.ts but resolves oddly under some TS configs
import Explosion from "react-native-confetti-cannon";
import { useAccessibility } from "../context/AccessibilityContext";

export interface ConfettiBurstHandle {
  fire: () => void;
}

const { width } = Dimensions.get("window");

/**
 * Mirrors the web app's canvas-confetti bursts on correct answers.
 * Usage: const confettiRef = useRef<ConfettiBurstHandle>(null);
 *        confettiRef.current?.fire();
 */
const ConfettiBurst = forwardRef<ConfettiBurstHandle>((_props, ref) => {
  const explosionRef = useRef<Explosion>(null);
  const { reduceMotion } = useAccessibility();

  useImperativeHandle(ref, () => ({
    fire: () => {
      if (!reduceMotion) explosionRef.current?.start();
    },
  }), [reduceMotion]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Explosion
        ref={explosionRef}
        count={80}
        origin={{ x: width / 2, y: 0 }}
        fadeOut
        autoStart={false}
      />
    </View>
  );
});

ConfettiBurst.displayName = "ConfettiBurst";

export default ConfettiBurst;
