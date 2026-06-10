import { Input, Select } from 'antd';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import { useTaskScoreGroupOptions } from '../../hooks/useTaskScoreGroupOptions';
import type { TaskScoreListFilters } from '../../schemas/taskScore.schema';
import styles from './TaskScoreFilters.module.scss';

interface TaskScoreFiltersProps {
  filters: TaskScoreListFilters;
  onChange: (filters: TaskScoreListFilters) => void;
  onReset: () => void;
}

export function TaskScoreFilters({ filters, onChange, onReset }: TaskScoreFiltersProps) {
  const { options, isLoading } = useTaskScoreGroupOptions();

  return (
    <FilterSection onReset={onReset}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="task-score-search">
          Search
        </label>
        <Input.Search
          id="task-score-search"
          placeholder="Search by task name"
          allowClear
          value={filters.search ?? ''}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value || undefined })
          }
          className={styles.search}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="task-score-group-filter">
          Group
        </label>
        <Select
          id="task-score-group-filter"
          placeholder="All groups"
          allowClear
          loading={isLoading}
          value={filters.group}
          onChange={(value) => onChange({ ...filters, group: value })}
          options={options}
          className={styles.select}
        />
      </div>
    </FilterSection>
  );
}
