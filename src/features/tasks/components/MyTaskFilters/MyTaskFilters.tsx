import { Button, DatePicker, Input, Select, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import { CONFIRMATION_OPTIONS } from '../../constants';
import { useMyTaskProjectOptions, useMyTaskStaffNameOptions } from '../../hooks/useMyTaskList';
import type { MyTaskListFilters, TaskCategory } from '../../schemas/task.schema';
import { todayWorkDate } from '../../utils/taskWorkDate';
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
  const today = todayWorkDate();
  const isTodaySelected = filters.workDate === today;

  return (
    <div className={styles.wrapper}>
      <FilterSection onReset={onReset} className={styles.filterSection}>
        {taskCategory === 'project' ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="my-task-work-date-filter">
              Ngày làm việc
            </label>
            <div className={styles.workDateControls}>
              <Tooltip title="Task có khoảng date → deadline trùng hôm nay">
                <Button
                  type={isTodaySelected ? 'primary' : 'default'}
                  onClick={() => onChange({ ...filters, workDate: today })}
                >
                  Hôm nay
                </Button>
              </Tooltip>
              <DatePicker
                id="my-task-work-date-filter"
                picker="date"
                allowClear
                format={DATE_FORMAT}
                placeholder="Tất cả ngày"
                presets={[{ label: 'Hôm nay', value: dayjs() }]}
                value={filters.workDate ? dayjs(filters.workDate, 'YYYY-MM-DD') : null}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    workDate: value?.format('YYYY-MM-DD'),
                  })
                }
                className={styles.datePicker}
              />
            </div>
          </div>
        ) : null}

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
                Hoàn thành trong tháng
              </label>
              <DatePicker
                id="my-task-completed-month-filter"
                picker="month"
                format="MM/YYYY"
                allowClear
                placeholder="Chọn tháng"
                value={filters.completedMonth ? dayjs(filters.completedMonth, 'YYYY-MM') : null}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    // Month filter requires a completion result; default to all finished tasks.
                    timeliness: value ? (filters.timeliness ?? 'completed') : undefined,
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
                Ngày task trong tháng
              </label>
              <DatePicker
                id="my-task-output-month-filter"
                picker="month"
                format="MM/YYYY"
                allowClear
                placeholder="Chọn tháng"
                value={filters.outputMonth ? dayjs(filters.outputMonth, 'YYYY-MM') : null}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    // Month filter requires an output type; default to project slides.
                    outputMetric: value ? (filters.outputMetric ?? 'project_slides') : undefined,
                    outputMonth: value?.format('YYYY-MM'),
                  })
                }
                className={styles.select}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="my-task-ot-filter">
                Overtime
              </label>
              <Select
                id="my-task-ot-filter"
                placeholder="Tất cả"
                allowClear
                value={filters.otOnly ? 'ot' : undefined}
                onChange={(value) =>
                  onChange({ ...filters, otOnly: value === 'ot' ? true : undefined })
                }
                options={[{ value: 'ot', label: 'Chỉ task OT' }]}
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
