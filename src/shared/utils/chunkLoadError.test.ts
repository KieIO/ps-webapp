import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { clearChunkReloadFlag, isChunkLoadError, reloadOnChunkLoadError } from './chunkLoadError';

describe('chunkLoadError', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('location', { reload: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detects Vite dynamic import failures', () => {
    expect(
      isChunkLoadError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://example.com/assets/Page.js',
        ),
      ),
    ).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isChunkLoadError(new Error('Network Error'))).toBe(false);
  });

  it('reloads once then stops', () => {
    const error = new TypeError('Failed to fetch dynamically imported module: /x.js');

    expect(reloadOnChunkLoadError(error)).toBe(true);
    expect(window.location.reload).toHaveBeenCalledTimes(1);

    expect(reloadOnChunkLoadError(error)).toBe(false);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('clears the reload flag', () => {
    sessionStorage.setItem('chunk-load-reload', '1');
    clearChunkReloadFlag();
    expect(sessionStorage.getItem('chunk-load-reload')).toBeNull();
  });
});
