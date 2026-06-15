import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SidebarShortcut } from '@/config/sidebar';
import {
  SHORTCUT_SEQUENCE_TIMEOUT_MS,
  isTypingTarget,
} from '@/shared/utils/keyboardShortcut';

export interface SidebarShortcutTarget {
  path: string;
  shortcut: SidebarShortcut;
}

export function useSidebarShortcuts(items: readonly SidebarShortcutTarget[]): void {
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length === 0) return;

    let pendingPrefix: string | null = null;
    let pendingTimeout: ReturnType<typeof setTimeout> | null = null;

    const clearPending = () => {
      pendingPrefix = null;
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        pendingTimeout = null;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTypingTarget(event.target)) return;

      if (event.key === 'Escape') {
        clearPending();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        clearPending();
        return;
      }

      const pressedKey = event.key.toLowerCase();

      if (pendingPrefix) {
        for (const item of items) {
          const [prefix, suffix] = item.shortcut.sequence;
          if (prefix === pendingPrefix && suffix === pressedKey) {
            event.preventDefault();
            clearPending();
            navigate(item.path);
            return;
          }
        }
        clearPending();
      }

      const isPrefixKey = items.some((item) => item.shortcut.sequence[0] === pressedKey);
      if (isPrefixKey) {
        pendingPrefix = pressedKey;
        if (pendingTimeout) clearTimeout(pendingTimeout);
        pendingTimeout = setTimeout(clearPending, SHORTCUT_SEQUENCE_TIMEOUT_MS);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearPending();
    };
  }, [items, navigate]);
}
