import { DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import type { CapacityListPeriodValue } from '../../utils/capacityPeriodFilters';
import styles from './CapacityPeriodFilters.module.scss';

const { RangePicker } = DatePicker;

export interface CapacityPeriodFiltersProps {
  filters: CapacityListPeriodValue;
  onChange: (filters: CapacityListPeriodValue) => void;
  monthPickerId?: string;
  rangePickerId?: string;
  datePickerId?: string;
}

export function CapacityPeriodFilters({
  filters,
  onChange,
  monthPickerId = 'capacity-month-filter',
  rangePickerId = 'capacity-range-filter',
  datePickerId = 'capacity-date-filter',
}: CapacityPeriodFiltersProps) {
  const handleMonthChange = (next: Dayjs | null) => {
    if (!next || filters.mode !== 'month') return;
    onChange({ mode: 'month', year: next.year(), month: next.month() + 1 });
  };

  const handleRangeChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (!values?.[0] || !values[1] || filters.mode !== 'range') return;
    onChange({
      mode: 'range',
      startDate: values[0].format('YYYY-MM-DD'),
      endDate: values[1].format('YYYY-MM-DD'),
    });
  };

  const handleDateChange = (next: Dayjs | null) => {
    if (!next || filters.mode !== 'date') return;
    onChange({ mode: 'date', date: next.format('YYYY-MM-DD') });
  };

  const rangeValue: [Dayjs, Dayjs] | null =
    filters.mode === 'range' ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null;

  if (filters.mode === 'date') {
    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={datePickerId}>
          Date
        </label>
        <DatePicker
          id={datePickerId}
          value={dayjs(filters.date)}
          onChange={handleDateChange}
          allowClear={false}
          format={DATE_FORMAT}
          className={styles.datePicker}
        />
      </div>
    );
  }

  if (filters.mode === 'month') {
    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={monthPickerId}>
          Month
        </label>
        <DatePicker
          id={monthPickerId}
          picker="month"
          value={dayjs().year(filters.year).month(filters.month - 1)}
          onChange={handleMonthChange}
          allowClear={false}
          format="MMMM YYYY"
          className={styles.monthPicker}
        />
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={rangePickerId}>
        Date range
      </label>
      <RangePicker
        id={rangePickerId}
        value={rangeValue}
        onChange={handleRangeChange}
        allowClear={false}
        format={DATE_FORMAT}
        className={styles.rangePicker}
      />
    </div>
  );
}
