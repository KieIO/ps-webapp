import { Input, Select } from 'antd';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import { useJobGroupList } from '../../hooks/useJobGroupList';
import { useJobLevelList } from '../../hooks/useJobLevelList';
import type { JobTitleListFilters } from '../../schemas/title.schema';
import styles from './JobTitleFilters.module.scss';

interface JobTitleFiltersProps {
  filters: JobTitleListFilters;
  onChange: (filters: JobTitleListFilters) => void;
  onReset: () => void;
}

export function JobTitleFilters({ filters, onChange, onReset }: JobTitleFiltersProps) {
  const { data: levels } = useJobLevelList();
  const { data: groups } = useJobGroupList();

  const levelOptions =
    levels?.items.map((level) => ({ value: level.id, label: `${level.code} — ${level.label}` })) ??
    [];

  const groupOptions =
    groups?.items.map((group) => ({ value: group.id, label: `${group.code} — ${group.label}` })) ??
    [];

  return (
    <FilterSection onReset={onReset}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="title-search">
          Search
        </label>
        <Input.Search
          id="title-search"
          placeholder="Search by code or title"
          allowClear
          value={filters.search ?? ''}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value || undefined })
          }
          className={styles.search}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="title-level-filter">
          Job level
        </label>
        <Select
          id="title-level-filter"
          placeholder="All levels"
          allowClear
          value={filters.jobLevelId}
          onChange={(value) => onChange({ ...filters, jobLevelId: value })}
          options={levelOptions}
          className={styles.select}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="title-group-filter">
          Job group
        </label>
        <Select
          id="title-group-filter"
          placeholder="All groups"
          allowClear
          value={filters.jobGroupId}
          onChange={(value) => onChange({ ...filters, jobGroupId: value })}
          options={groupOptions}
          className={styles.select}
        />
      </div>
    </FilterSection>
  );
}
