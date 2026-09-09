import { Button, Segmented, Select } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import { DEPARTMENT_OPTIONS, WORK_STATUS_OPTIONS } from '../../constants';
import type { CapacityListFilters } from '../../schemas/capacity.schema';
import { resolveCapacityListAnchorDate } from '../../utils/capacityListPeriod';
import {
  applyCapacityListPeriodChange,
  getCapacityListPeriod,
} from '../../utils/capacityPeriodFilters';
import { CapacityPeriodFilters } from '../CapacityPeriodFilters/CapacityPeriodFilters';
import periodStyles from '../CapacityPeriodFilters/CapacityPeriodFilters.module.scss';
import styles from './CapacityFilters.module.scss';

interface CapacityFiltersProps {
  filters: CapacityListFilters;
  onChange: (filters: CapacityListFilters) => void;
  onReset: () => void;
  onExport: () => void;
  exporting?: boolean;
  exportDisabled?: boolean;
}

export function CapacityFilters({
  filters,
  onChange,
  onReset,
  onExport,
  exporting,
  exportDisabled,
}: CapacityFiltersProps) {
  const handleModeChange = (mode: string) => {
    const anchor = resolveCapacityListAnchorDate(filters);

    if (mode === 'month') {
      onChange(
        applyCapacityListPeriodChange(filters, {
          mode: 'month',
          year: anchor.year(),
          month: anchor.month() + 1,
        }),
      );
      return;
    }

    if (mode === 'range') {
      onChange(
        applyCapacityListPeriodChange(filters, {
          mode: 'range',
          startDate: anchor.startOf('month').format('YYYY-MM-DD'),
          endDate: anchor.endOf('month').format('YYYY-MM-DD'),
        }),
      );
      return;
    }

    onChange({
      department: filters.department,
      workStatus: filters.workStatus,
      mode: 'date',
      date: anchor.format('YYYY-MM-DD'),
    });
  };

  return (
    <div className={styles.wrapper}>
      <FilterSection onReset={onReset} className={styles.filterSection}>
        <div className={periodStyles.modeField}>
          <span className={periodStyles.label}>Period type</span>
          <Segmented
            value={filters.mode}
            onChange={handleModeChange}
            options={[
              { label: 'Month', value: 'month' },
              { label: 'Date range', value: 'range' },
              { label: 'Date', value: 'date' },
            ]}
          />
        </div>

        <CapacityPeriodFilters
          filters={getCapacityListPeriod(filters)}
          onChange={(period) => onChange(applyCapacityListPeriodChange(filters, period))}
          monthPickerId="capacity-daily-month-filter"
          rangePickerId="capacity-daily-range-filter"
          datePickerId="capacity-daily-date-filter"
        />

        <div className={styles.field}>
          <label className={styles.label} htmlFor="capacity-department-filter">
            Department
          </label>
          <Select
            id="capacity-department-filter"
            placeholder="All departments"
            allowClear
            value={filters.department}
            onChange={(value) => onChange({ ...filters, department: value })}
            options={DEPARTMENT_OPTIONS}
            className={styles.select}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="capacity-work-status-filter">
            Work Status
          </label>
          <Select
            id="capacity-work-status-filter"
            placeholder="All statuses"
            allowClear
            value={filters.workStatus}
            onChange={(value) => onChange({ ...filters, workStatus: value })}
            options={WORK_STATUS_OPTIONS}
            className={styles.select}
          />
        </div>
      </FilterSection>

      <Button
        icon={<DownloadOutlined />}
        onClick={onExport}
        loading={exporting}
        disabled={exportDisabled}
        className={styles.export}
      >
        Xuất Excel
      </Button>
    </div>
  );
}
