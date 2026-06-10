import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { useTaskScoreGroupOptions } from '../../hooks/useTaskScoreGroupOptions';
import { useTaskScoreList } from '../../hooks/useTaskScoreList';
import type { TaskScore, TaskScoreListFilters } from '../../schemas/taskScore.schema';
import { TaskScoreFilters } from '../TaskScoreFilters/TaskScoreFilters';
import { TaskScoreTable } from '../TaskScoreTable/TaskScoreTable';

const DEFAULT_FILTERS: TaskScoreListFilters = {};

interface TaskScoreListProps {
  onEdit: (item: TaskScore) => void;
}

export function TaskScoreList({ onEdit }: TaskScoreListProps) {
  const [filters, setFilters] = useState<TaskScoreListFilters>(DEFAULT_FILTERS);
  const [debouncedSearch] = useDebounce(filters.search, 300);
  const { groupByCode } = useTaskScoreGroupOptions();

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const { data, isLoading } = useTaskScoreList(queryFilters);

  return (
    <>
      <TaskScoreFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <CardWrapper title="Task scores" subtitle={`${data?.total ?? 0} total`}>
        <TaskScoreTable
          items={data?.items ?? []}
          groupByCode={groupByCode}
          loading={isLoading}
          onEdit={onEdit}
        />
      </CardWrapper>
    </>
  );
}
