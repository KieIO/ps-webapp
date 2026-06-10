const MOCK_DELAY_MS = Number(import.meta.env.VITE_MOCK_DELAY_MS ?? 0);

/** Optional artificial latency for mock APIs (default 0 — instant in dev). */
export const mockDelay = (): Promise<void> =>
  MOCK_DELAY_MS > 0
    ? new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
    : Promise.resolve();
