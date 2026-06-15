import { Segmented } from 'antd';
import dayjs from 'dayjs';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import type { CapacityMonthlyFilters } from '../../schemas/capacityMonthly.schema';
import { CapacityPeriodFilters } from '../CapacityPeriodFilters/CapacityPeriodFilters';
import periodStyles from '../CapacityPeriodFilters/CapacityPeriodFilters.module.scss';

interface CapacityMonthlyFiltersProps {
  filters: CapacityMonthlyFilters;
  onChange: (filters: CapacityMonthlyFilters) => void;
  onReset: () => void;
}

export function CapacityMonthlyFilters({
  filters,
  onChange,
  onReset,
}: CapacityMonthlyFiltersProps) {
  const handleModeChange = (mode: string) => {
    if (mode === 'month') {
      const anchor =
        filters.mode === 'range'
          ? dayjs(filters.startDate)
          : dayjs().year(filters.year).month(filters.month - 1);
      onChange({
        mode: 'month',
        year: anchor.year(),
        month: anchor.month() + 1,
      });
      return;
    }

    const anchor =
      filters.mode === 'month'
        ? dayjs().year(filters.year).month(filters.month - 1)
        : dayjs(filters.startDate);
    onChange({
      mode: 'range',
      startDate: anchor.startOf('month').format('YYYY-MM-DD'),
      endDate: anchor.endOf('month').format('YYYY-MM-DD'),
    });
  };

  return (
    <FilterSection onReset={onReset}>
      <div className={periodStyles.modeField}>
        <span className={periodStyles.label}>Period type</span>
        <Segmented
          value={filters.mode}
          onChange={handleModeChange}
          options={[
            { label: 'Month', value: 'month' },
            { label: 'Date range', value: 'range' },
          ]}
        />
      </div>

      <CapacityPeriodFilters
        filters={filters}
        onChange={(period) => {
          if (period.mode !== 'date') {
            onChange(period);
          }
        }}
      />
    </FilterSection>
  );
}
