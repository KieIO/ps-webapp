import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { clearChunkReloadFlag, reloadOnChunkLoadError } from './chunkLoadError';

type ModuleDefault<T> = { default: T };

/**
 * React.lazy wrapper that reloads the page once when a code-split chunk
 * fails to load (common after a new deploy while an old tab is open).
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<ModuleDefault<T>>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const module = await factory();
      clearChunkReloadFlag();
      return module;
    } catch (error) {
      if (reloadOnChunkLoadError(error)) {
        // Keep Suspense pending while the page reloads.
        return new Promise(() => undefined);
      }
      throw error;
    }
  });
}
