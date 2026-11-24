import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'pokeslide.tracker.sortBySalesName';

const readStored = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/** Tracker preference: order project rows by Sales name A→Z (persisted locally). */
export const useTrackerSortBySales = () => {
  const [sortBySalesName, setSortBySalesNameState] = useState(false);

  useEffect(() => {
    setSortBySalesNameState(readStored());
  }, []);

  const setSortBySalesName = useCallback((next: boolean) => {
    setSortBySalesNameState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore quota / private mode
    }
  }, []);

  return { sortBySalesName, setSortBySalesName } as const;
};
