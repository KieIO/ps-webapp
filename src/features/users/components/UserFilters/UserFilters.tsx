import { Input, Select } from 'antd';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import { DEPARTMENT_OPTIONS, ROLE_OPTIONS, STATUS_OPTIONS } from '../../constants';
import type { UserListFilters } from '../../schemas/user.schema';
import styles from './UserFilters.module.scss';

interface UserFiltersProps {
  filters: UserListFilters;
  onChange: (filters: UserListFilters) => void;
  onReset: () => void;
}

export function UserFilters({ filters, onChange, onReset }: UserFiltersProps) {
  return (
    <FilterSection onReset={onReset}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="user-search">
          Search
        </label>
        <Input.Search
          id="user-search"
          placeholder="Search by name or email"
          allowClear
          value={filters.search ?? ''}
          onChange={(event) => onChange({ ...filters, search: event.target.value || undefined })}
          className={styles.search}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="user-role-filter">
          Role
        </label>
        <Select
          id="user-role-filter"
          placeholder="All roles"
          allowClear
          value={filters.role}
          onChange={(value) => onChange({ ...filters, role: value })}
          options={ROLE_OPTIONS}
          className={styles.select}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="user-status-filter">
          Status
        </label>
        <Select
          id="user-status-filter"
          placeholder="All statuses"
          allowClear
          value={filters.status}
          onChange={(value) => onChange({ ...filters, status: value })}
          options={STATUS_OPTIONS}
          className={styles.select}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="user-department-filter">
          Department
        </label>
        <Select
          id="user-department-filter"
          placeholder="All departments"
          allowClear
          value={filters.department}
          onChange={(value) => onChange({ ...filters, department: value })}
          options={DEPARTMENT_OPTIONS}
          className={styles.select}
        />
      </div>
    </FilterSection>
  );
}
