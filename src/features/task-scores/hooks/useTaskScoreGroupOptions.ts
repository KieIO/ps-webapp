import { useMemo } from 'react';
import { useTaskScoreGroupList } from './useTaskScoreGroupList';

export const useTaskScoreGroupOptions = (options?: { enabled?: boolean }) => {
  const { data, isLoading } = useTaskScoreGroupList(options);

  const groupOptions = useMemo(
    () =>
      (data?.items ?? []).map((group) => ({
        value: group.code,
        label: group.label,
      })),
    [data?.items],
  );

  const groupByCode = useMemo(
    () => Object.fromEntries((data?.items ?? []).map((group) => [group.code, group])),
    [data?.items],
  );

  const defaultGroupCode = data?.items[0]?.code;

  return { options: groupOptions, groupByCode, defaultGroupCode, isLoading };
};
