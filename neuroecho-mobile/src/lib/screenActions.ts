// Lets the AI companion trigger the primary "start" action of whichever
// game screen it just navigated to, without those screens needing to know
// anything about the companion. A screen registers itself while focused;
// the registry only ever holds the currently-focused screen's handlers.
interface ScreenActionHandlers {
  start?: () => void;
}

let current: ScreenActionHandlers | null = null;

export function registerScreenActions(handlers: ScreenActionHandlers) {
  current = handlers;
}

export function clearScreenActions(handlers: ScreenActionHandlers) {
  if (current === handlers) current = null;
}

export function triggerScreenStart(): boolean {
  if (current?.start) {
    current.start();
    return true;
  }
  return false;
}
