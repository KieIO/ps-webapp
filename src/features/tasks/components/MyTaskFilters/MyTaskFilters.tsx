import { Button, DatePicker, Input, Select } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import { CONFIRMATION_OPTIONS } from '../../constants';
import { useMyTaskProjectOptions, useMyTaskStaffNameOptions } from '../../hooks/useMyTaskList';
import type { MyTaskListFilters, TaskCategory } from '../../schemas/task.schema';
import styles from './MyTaskFilters.module.scss';

interface MyTaskFiltersProps {
  taskCategory: TaskCategory;
  filters: MyTaskListFilters;
  onChange: (filters: MyTaskListFilters) => void;
  onReset: () => void;
  onExport: () => void;
  exporting?: boolean;
}

export function MyTaskFilters({
  taskCategory,
  filters,
  onChange,
  onReset,
  onExport,
  exporting,
}: MyTaskFiltersProps) {
  const { data: projectOptions = [] } = useMyTaskProjectOptions(taskCategory);
  const { data: staffNameOptions = [] } = useMyTaskStaffNameOptions(taskCategory);

  return (
    <div className={styles.wrapper}>
      <FilterSection onReset={onReset} className={styles.filterSection}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="my-task-search">
            Search
          </label>
          <Input.Search
            id="my-task-search"
            placeholder="Search project, task, or description..."
            allowClear
            value={filters.search ?? ''}
            onChange={(event) => onChange({ ...filters, search: event.target.value || undefined })}
            className={styles.search}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="my-task-project-filter">
            Project
          </label>
          <Select
            id="my-task-project-filter"
            placeholder="All projects"
            allowClear
            value={filters.projectName}
            onChange={(value) => onChange({ ...filters, projectName: value })}
            options={projectOptions.map((name) => ({ value: name, label: name }))}
            className={styles.select}
          />
        </div>

        {taskCategory === 'project' ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="my-task-staff-filter">
              Staff name
            </label>
            <Select
              id="my-task-staff-filter"
              placeholder="All staff"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.staffName}
              onChange={(value) => onChange({ ...filters, staffName: value })}
              options={staffNameOptions.map((name) => ({ value: name, label: name }))}
              className={styles.select}
            />
          </div>
        ) : null}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="my-task-confirmation-filter">
            Trạng thái
          </label>
          <Select
            id="my-task-confirmation-filter"
            placeholder="All statuses"
            allowClear
            value={filters.confirmation}
            onChange={(value) => onChange({ ...filters, confirmation: value })}
            options={[...CONFIRMATION_OPTIONS]}
            className={styles.select}
          />
        </div>

        {taskCategory === 'project' ? (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="my-task-timeliness-filter">
                Kết quả hoàn thành
              </label>
              <Select
                id="my-task-timeliness-filter"
                placeholder="Tất cả task"
                allowClear
                value={filters.timeliness}
                onChange={(value) => {
                  onChange({
                    ...filters,
                    timeliness: value,
                    completedMonth: value
                      ? (filters.completedMonth ?? dayjs().format('YYYY-MM'))
                      : undefined,
                  });
                }}
                options={[
                  { value: 'completed', label: 'Tất cả đã hoàn thành' },
                  { value: 'on_time', label: 'Đúng hạn' },
                  { value: 'not_on_time', label: 'Không đúng hạn' },
                ]}
                className={styles.select}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="my-task-completed-month-filter">
                Tháng hoàn thành
              </label>
              <DatePicker
                id="my-task-completed-month-filter"
                picker="month"
                format="MM/YYYY"
                allowClear
                disabled={!filters.timeliness}
                value={filters.completedMonth ? dayjs(filters.completedMonth, 'YYYY-MM') : null}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    timeliness: value ? filters.timeliness : undefined,
                    completedMonth: value?.format('YYYY-MM'),
                  })
                }
                className={styles.select}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="my-task-output-filter">
                Loại output
              </label>
              <Select
                id="my-task-output-filter"
                placeholder="Tất cả output"
                allowClear
                value={filters.outputMetric}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    outputMetric: value,
                    outputMonth: value
                      ? (filters.outputMonth ?? dayjs().format('YYYY-MM'))
                      : undefined,
                  })
                }
                options={[
                  { value: 'project_slides', label: 'Slides · Project' },
                  { value: 'creative_da', label: 'DA · Creative' },
                ]}
                className={styles.select}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="my-task-output-month-filter">
                Tháng task
              </label>
              <DatePicker
                id="my-task-output-month-filter"
                picker="month"
                format="MM/YYYY"
                allowClear
                disabled={!filters.outputMetric}
                value={filters.outputMonth ? dayjs(filters.outputMonth, 'YYYY-MM') : null}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    outputMetric: value ? filters.outputMetric : undefined,
                    outputMonth: value?.format('YYYY-MM'),
                  })
                }
                className={styles.select}
              />
            </div>
          </>
        ) : null}
      </FilterSection>

      <Button
        icon={<DownloadOutlined />}
        onClick={onExport}
        loading={exporting}
        className={styles.export}
      >
        Export Excel
      </Button>
    </div>
  );
}
