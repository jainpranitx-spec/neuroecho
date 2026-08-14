/**
 * ErrorBoundary only catches errors thrown during React's render/commit
 * cycle. Errors thrown inside event handlers, timers, or unhandled promise
 * rejections (a common source of "app just stops responding" reports,
 * since a rejected promise in a fire-and-forget call silently vanishes
 * otherwise) bypass it entirely. This wires up the lower-level hooks so
 * those get logged instead of disappearing.
 */
export function setupGlobalErrorHandlers() {
  const rnGlobal = globalThis as typeof globalThis & {
    ErrorUtils?: {
      setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
      getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
    };
    HermesInternal?: unknown;
  };

  if (rnGlobal.ErrorUtils) {
    const previousHandler = rnGlobal.ErrorUtils.getGlobalHandler();
    rnGlobal.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error(`[GlobalError]${isFatal ? " (fatal)" : ""}`, error);
      previousHandler?.(error, isFatal);
    });
  }

  // Hermes/JSC don't emit a DOM-style 'unhandledrejection' event by default
  // in React Native; the promise polyfill used here does when available.
  const promiseGlobal = globalThis as unknown as {
    addEventListener?: (type: string, listener: (event: unknown) => void) => void;
  };
  promiseGlobal.addEventListener?.("unhandledrejection", (event) => {
    const reason = (event as { reason?: unknown })?.reason;
    console.error("[UnhandledRejection]", reason);
  });
}
