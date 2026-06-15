export interface KeyboardShortcut {
  /** Two-key sequence, e.g. `['a', 'p']` — avoids browser shortcut conflicts. */
  sequence: readonly [string, string];
}

export const SHORTCUT_SEQUENCE_TIMEOUT_MS = 1000;

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;

  return target.isContentEditable;
}

export function formatShortcutLabel(shortcut: KeyboardShortcut): string {
  const [first, second] = shortcut.sequence;
  return `${first.toUpperCase()} → ${second.toUpperCase()}`;
}
