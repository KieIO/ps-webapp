import { Button, Segmented } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import type { CapacityMonthlyFilters } from '../../schemas/capacityMonthly.schema';
import { CapacityPeriodFilters } from '../CapacityPeriodFilters/CapacityPeriodFilters';
import periodStyles from '../CapacityPeriodFilters/CapacityPeriodFilters.module.scss';
import styles from './CapacityMonthlyFilters.module.scss';

interface CapacityMonthlyFiltersProps {
  filters: CapacityMonthlyFilters;
  onChange: (filters: CapacityMonthlyFilters) => void;
  onReset: () => void;
  onExport: () => void;
  exporting?: boolean;
  exportDisabled?: boolean;
}

export function CapacityMonthlyFilters({
  filters,
  onChange,
  onReset,
  onExport,
  exporting,
  exportDisabled,
}: CapacityMonthlyFiltersProps) {
  const handleModeChange = (mode: string) => {
    if (mode === 'month') {
      const anchor =
        filters.mode === 'range'
          ? dayjs(filters.startDate)
          : dayjs()
              .year(filters.year)
              .month(filters.month - 1);
      onChange({
        mode: 'month',
        year: anchor.year(),
        month: anchor.month() + 1,
      });
      return;
    }

    const anchor =
      filters.mode === 'month'
        ? dayjs()
            .year(filters.year)
            .month(filters.month - 1)
        : dayjs(filters.startDate);
    onChange({
      mode: 'range',
      startDate: anchor.startOf('month').format('YYYY-MM-DD'),
      endDate: anchor.endOf('month').format('YYYY-MM-DD'),
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
