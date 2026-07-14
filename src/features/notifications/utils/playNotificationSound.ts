/**
 * Soft two-tone notification chime via Web Audio (no asset file).
 * Browsers may suspend AudioContext until a user gesture — we unlock on first interaction.
 */

let sharedContext: AudioContext | null = null;
let unlockBound = false;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;

  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new Ctx();
  }
  return sharedContext;
};

const unlockAudio = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
};

/** Call once from the app shell so later notification sounds can play. */
export const bindNotificationSoundUnlock = (): (() => void) => {
  if (typeof window === 'undefined' || unlockBound) return () => undefined;
  unlockBound = true;

  const onInteract = () => unlockAudio();
  window.addEventListener('pointerdown', onInteract, { passive: true });
  window.addEventListener('keydown', onInteract);

  return () => {
    window.removeEventListener('pointerdown', onInteract);
    window.removeEventListener('keydown', onInteract);
    unlockBound = false;
  };
};

const tone = (
  ctx: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  peakGain: number,
) => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
};

/** Play a short chime. Safe to call from SSE handlers — failures are ignored. */
export const playNotificationSound = (): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const start = () => {
      const now = ctx.currentTime;
      tone(ctx, 880, now, 0.14, 0.045);
      tone(ctx, 1174.66, now + 0.1, 0.18, 0.035);
    };

    if (ctx.state === 'suspended') {
      void ctx
        .resume()
        .then(start)
        .catch(() => undefined);
      return;
    }

    start();
  } catch {
    // Autoplay / unsupported context — skip silently.
  }
};
