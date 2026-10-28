import { DatePicker, Input, Select } from 'antd';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import { CONFIRMATION_OPTIONS } from '../../constants';
import {
  CREATIVE_ASSIGN_SHAPE_OPTIONS,
  CREATIVE_EVALUATION_OPTIONS_HANDOFF,
  CREATIVE_EVALUATION_OPTIONS_STAFF,
  type CreativeAssignShapeFilter,
  type CreativeEvaluationFilter,
  type CreativeQueueFilterVisibility,
  type CreativeQueueListFilters,
} from '../../utils/creativeQueueFilters';
import type { TaskConfirmationStatus } from '../../schemas/task.schema';
import styles from '../MyTaskFilters/MyTaskFilters.module.scss';

interface CreativeQueueFiltersProps {
  filters: CreativeQueueListFilters;
  visibility: CreativeQueueFilterVisibility;
  projectOptions: string[];
  onChange: (filters: CreativeQueueListFilters) => void;
  onReset: () => void;
}

export function CreativeQueueFilters({
  filters,
  visibility,
  projectOptions,
  onChange,
  onReset,
}: CreativeQueueFiltersProps) {
  const evaluationOptions =
    visibility.evaluationLayer === 'handoff'
      ? CREATIVE_EVALUATION_OPTIONS_HANDOFF
      : CREATIVE_EVALUATION_OPTIONS_STAFF;
  const assignShapeOptions = CREATIVE_ASSIGN_SHAPE_OPTIONS.filter((option) =>
    visibility.assignShapeOptions.includes(option.value),
  );

  return (
    <div className={styles.wrapper}>
      <FilterSection onReset={onReset} className={styles.filterSection}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="creative-queue-search">
            Search
          </label>
          <Input.Search
            id="creative-queue-search"
            placeholder="Search project, task, or description..."
            allowClear
            value={filters.search ?? ''}
            onChange={(event) => onChange({ ...filters, search: event.target.value || undefined })}
            className={styles.search}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="creative-queue-project">
            Project
          </label>
          <Select
            id="creative-queue-project"
            placeholder="All projects"
            allowClear
            value={filters.projectName}
            onChange={(value) => onChange({ ...filters, projectName: value })}
            options={projectOptions.map((name) => ({ value: name, label: name }))}
            className={styles.select}
          />
        </div>

        {visibility.showAssignShape ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="creative-queue-assign-shape">
              Hình thức giao
            </label>
            <Select
              id="creative-queue-assign-shape"
              value={filters.assignShape ?? 'all'}
              onChange={(value: CreativeAssignShapeFilter) => {
                const next: CreativeQueueListFilters = {
                  ...filters,
                  assignShape: value,
                };
                if (value !== 'split' && value !== 'split_child') {
                  next.splitFrom = undefined;
                  next.splitTo = undefined;
                }
                onChange(next);
              }}
              options={assignShapeOptions}
              className={styles.select}
            />
          </div>
        ) : null}

        {visibility.showSplitDate ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="creative-queue-split-range">
              Thời gian chia
            </label>
            <DatePicker.RangePicker
              id="creative-queue-split-range"
              allowClear
              format={DATE_FORMAT}
              value={
                filters.splitFrom || filters.splitTo
                  ? [
                      filters.splitFrom ? dayjs(filters.splitFrom, 'YYYY-MM-DD') : null,
                      filters.splitTo ? dayjs(filters.splitTo, 'YYYY-MM-DD') : null,
                    ]
                  : null
              }
              onChange={(values) =>
                onChange({
                  ...filters,
                  splitFrom: values?.[0]?.format('YYYY-MM-DD'),
                  splitTo: values?.[1]?.format('YYYY-MM-DD'),
                })
              }
              className={styles.datePicker}
              style={{ width: 260 }}
            />
          </div>
        ) : null}

        {visibility.showEvaluation ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="creative-queue-evaluation">
              Đánh giá
            </label>
            <Select
              id="creative-queue-evaluation"
              value={filters.evaluation ?? 'all'}
              onChange={(value: CreativeEvaluationFilter) =>
                onChange({ ...filters, evaluation: value })
              }
              options={evaluationOptions}
              className={styles.select}
            />
          </div>
        ) : null}

        {visibility.showConfirmation ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="creative-queue-confirmation">
              Trạng thái Staff
            </label>
            <Select
              id="creative-queue-confirmation"
              placeholder="Tất cả trạng thái"
              allowClear
              value={filters.confirmation}
              onChange={(value: TaskConfirmationStatus | undefined) =>
                onChange({ ...filters, confirmation: value })
              }
              options={[...CONFIRMATION_OPTIONS]}
              className={styles.select}
            />
          </div>
        ) : null}
      </FilterSection>
    </div>
  );
}
