import { useMemo } from 'react';
import { useJobTitleList } from './useJobTitleList';

export const useJobTitleOptions = () => {
  const { data, isLoading } = useJobTitleList({});

  const options = useMemo(
    () =>
      (data?.items ?? []).map((title) => ({
        value: title.id,
        label: `${title.code} — ${title.name}`,
      })),
    [data?.items],
  );

  return { options, isLoading };
};
