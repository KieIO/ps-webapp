const CHUNK_RELOAD_KEY = 'chunk-load-reload';

/** Detect Vite/Webpack chunk load failures after a new deploy. */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    error.name === 'ChunkLoadError' ||
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('error loading dynamically imported module')
  );
}

export function clearChunkReloadFlag(): void {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
}

/**
 * Reload once when a stale chunk is requested after deploy.
 * Returns true if a reload was triggered.
 */
export function reloadOnChunkLoadError(error: unknown): boolean {
  if (!isChunkLoadError(error)) return false;

  const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';
  if (alreadyReloaded) {
    clearChunkReloadFlag();
    return false;
  }

  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  window.location.reload();
  return true;
}
