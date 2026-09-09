import { Button, DatePicker, Input, Select } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import { DATE_FORMAT } from '@/config/constants';
import { OT_FILTER_LABELS, OT_STATUS_OPTIONS } from '../../constants';
import type { OvertimeListFilters } from '../../schemas/overtime.schema';
import styles from './OvertimeFilters.module.scss';

interface SelectOption {
  value: string;
  label: string;
}

interface OvertimeFiltersProps {
  filters: OvertimeListFilters;
  onChange: (filters: OvertimeListFilters) => void;
  onReset: () => void;
  onExport: () => void;
  exporting?: boolean;
  projectOptions?: SelectOption[];
  assigneeOptions?: SelectOption[];
  projectOptionsLoading?: boolean;
}

export function OvertimeFilters({
  filters,
  onChange,
  onReset,
  onExport,
  exporting,
  projectOptions = [],
  assigneeOptions = [],
  projectOptionsLoading = false,
}: OvertimeFiltersProps) {
  const rangeValue: [Dayjs, Dayjs] | null =
    filters.fromDate && filters.toDate ? [dayjs(filters.fromDate), dayjs(filters.toDate)] : null;
  const hasDateRange = Boolean(filters.fromDate && filters.toDate);

  return (
    <div className={styles.wrapper}>
      <FilterSection onReset={onReset} className={styles.filterSection}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ot-search">
            {OT_FILTER_LABELS.search}
          </label>
          <Input.Search
            id="ot-search"
            placeholder={OT_FILTER_LABELS.searchPlaceholder}
            allowClear
            value={filters.search ?? ''}
            onChange={(event) => onChange({ ...filters, search: event.target.value || undefined })}
            className={styles.search}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ot-status">
            {OT_FILTER_LABELS.status}
          </label>
          <Select
            id="ot-status"
            placeholder={OT_FILTER_LABELS.statusPlaceholder}
            allowClear
            value={filters.status}
            onChange={(value) => onChange({ ...filters, status: value })}
            options={[...OT_STATUS_OPTIONS]}
            className={styles.select}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ot-date-range">
            {OT_FILTER_LABELS.dateRange}
          </label>
          <DatePicker.RangePicker
            id="ot-date-range"
            format={DATE_FORMAT}
            value={rangeValue}
            onChange={(dates) => {
              const fromDate = dates?.[0]?.format('YYYY-MM-DD');
              const toDate = dates?.[1]?.format('YYYY-MM-DD');
              onChange({
                ...filters,
                fromDate,
                toDate,
                // Project options depend on the date range; clear stale selection.
                projectId: undefined,
              });
            }}
            className={styles.range}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ot-project">
            {OT_FILTER_LABELS.project}
          </label>
          <Select
            id="ot-project"
            placeholder={
              hasDateRange ? 'Dự án có OT trong khoảng ngày' : OT_FILTER_LABELS.projectPlaceholder
            }
            allowClear
            showSearch
            optionFilterProp="label"
            value={filters.projectId}
            onChange={(value) => onChange({ ...filters, projectId: value })}
            options={projectOptions}
            loading={projectOptionsLoading}
            notFoundContent={hasDateRange ? 'Không có dự án OT trong khoảng ngày' : undefined}
            className={styles.select}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ot-assignee">
            {OT_FILTER_LABELS.assignee}
          </label>
          <Select
            id="ot-assignee"
            placeholder={OT_FILTER_LABELS.assigneePlaceholder}
            allowClear
            showSearch
            optionFilterProp="label"
            value={filters.assigneeId}
            onChange={(value) => onChange({ ...filters, assigneeId: value })}
            options={assigneeOptions}
            className={styles.select}
          />
        </div>
      </FilterSection>

      <Button
        icon={<DownloadOutlined />}
        onClick={onExport}
        loading={exporting}
        className={styles.export}
      >
        {OT_FILTER_LABELS.export}
      </Button>
    </div>
  );
}
