import { useCallback, useRef } from "react";

/**
 * Guards a handler against re-entry from rapid double-taps.
 *
 * `disabled={someState}` on a Pressable isn't enough on its own: React
 * state updates aren't synchronous, so two taps that land in the same
 * frame (easy to do with "tremor-proof" oversized buttons, or just an
 * eager double-tap) can both fire before the first re-render disables the
 * button — leading to duplicate scoring, duplicate API calls, or two
 * overlapping speech/confetti triggers that make the UI feel stuck.
 *
 * A ref-based lock closes that gap: it's read/written synchronously, so
 * the second tap sees the lock immediately, before any render happens.
 */
export function useAsyncGuard() {
  const lockedRef = useRef(false);

  const runGuarded = useCallback((fn: () => void | Promise<void>) => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    const release = () => {
      lockedRef.current = false;
    };

    try {
      const result = fn();
      if (result instanceof Promise) {
        result.then(release, release);
      } else {
        release();
      }
    } catch (err) {
      release();
      throw err;
    }
  }, []);

  return { runGuarded, isLocked: () => lockedRef.current };
}
