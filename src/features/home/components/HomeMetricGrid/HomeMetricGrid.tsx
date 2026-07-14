import {
  AlertOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { DATE_FORMAT, ROUTES, buildProjectDetailPath } from '@/config/constants';
import { HOME_PLACEHOLDER_FORMULA_NOTE } from '../../constants';
import type { DeadlineRiskProject } from '../../utils/homeMetrics';
import { HomeMetricCard } from '../HomeMetricCard/HomeMetricCard';
import styles from './HomeMetricGrid.module.scss';

interface TaskTypeBreakdown {
  type: string;
  count: number;
}

interface HomeMetricGridProps {
  runningProjectCount: number;
  runningProjectsPreview: DeadlineRiskProject[];
  deadlineRiskCount: number;
  deadlineRiskDays: number;
  deadlineRiskProjects: DeadlineRiskProject[];
  todayTaskCount: number;
  todayLabel: string;
  scopedTaskTotal: number;
  tasksByType: TaskTypeBreakdown[];
  departmentCapacityPercent: number | null;
  companyCapacityPercent: number | null;
}

const formatCapacity = (value: number | null): string =>
  value == null ? '—' : `${Math.round(value)}%`;

const formatDaysUntilLabel = (daysUntil: number): string => {
  if (daysUntil < 0) return `quá hạn ${Math.abs(daysUntil)} ngày`;
  if (daysUntil === 0) return 'đến hạn hôm nay';
  return `còn ${daysUntil} ngày`;
};

const renderProjectPreviewFooter = (projects: DeadlineRiskProject[]) => {
  const preview = projects.slice(0, 2);
  const moreCount = Math.max(0, projects.length - preview.length);

  if (preview.length === 0) {
    return (
      <Link to={ROUTES.PROJECTS} className={styles.link}>
        Xem projects →
      </Link>
    );
  }

  return (
    <div className={styles.riskList}>
      <ul className={styles.riskItems}>
        {preview.map((project) => (
          <li key={project.id}>
            <Link to={buildProjectDetailPath(project.id)} className={styles.riskLink}>
              {project.name}
            </Link>
            <span className={styles.riskMeta}>
              {dayjs(project.endDate).format(DATE_FORMAT)} ·{' '}
              {formatDaysUntilLabel(project.daysUntil)}
            </span>
          </li>
        ))}
      </ul>
      {moreCount > 0 && <p className={styles.riskMore}>+{moreCount} project khác</p>}
      <Link to={ROUTES.PROJECTS} className={styles.link}>
        Xem tất cả projects →
      </Link>
    </div>
  );
};

export function HomeMetricGrid({
  runningProjectCount,
  runningProjectsPreview,
  deadlineRiskCount,
  deadlineRiskDays,
  deadlineRiskProjects,
  todayTaskCount,
  todayLabel,
  scopedTaskTotal,
  tasksByType,
  departmentCapacityPercent,
  companyCapacityPercent,
}: HomeMetricGridProps) {
  const topTypes = tasksByType.slice(0, 4);
  const maxTypeCount = topTypes[0]?.count ?? 1;
  const typeCount = tasksByType.length;

  const tasksTodayHint = `Hôm nay (${todayLabel}) · date → deadline`;

  const tasksByTypeHint =
    todayTaskCount === 0
      ? scopedTaskTotal > 0
        ? `${scopedTaskTotal} task trong phạm vi · không có task nào diễn ra hôm nay`
        : 'Chưa có task trong phạm vi'
      : `${typeCount} loại · ${todayTaskCount} task`;

  const tasksByTypeFooter =
    topTypes.length > 0 ? (
      <ul className={styles.typeList}>
        {topTypes.map((entry) => (
          <li key={entry.type} className={styles.typeItem}>
            <div className={styles.typeMeta}>
              <span className={styles.typeName}>{entry.type}</span>
              <span className={styles.typeCount}>{entry.count}</span>
            </div>
            <div className={styles.typeTrack}>
              <span
                className={styles.typeFill}
                style={{ width: `${Math.max(8, (entry.count / maxTypeCount) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className={styles.emptyTypes}>
        {scopedTaskTotal > 0 ? (
          <>
            Task list có {scopedTaskTotal} task (mọi ngày). Chỉ task có lịch bao gồm{' '}
            <strong>{todayLabel}</strong> mới hiển thị ở đây.
          </>
        ) : (
          'Chưa có task trong phạm vi role của bạn.'
        )}{' '}
        <Link to={ROUTES.PROJECT_TASKS} className={styles.link}>
          Xem task list →
        </Link>
      </p>
    );

  return (
    <div className={styles.grid}>
      <HomeMetricCard
        label="Running projects"
        value={runningProjectCount}
        hint={
          deadlineRiskCount > 0
            ? `${deadlineRiskCount} dự án gần deadline`
            : 'Không có dự án gần deadline'
        }
        icon={<FolderOpenOutlined />}
        footer={renderProjectPreviewFooter(runningProjectsPreview)}
      />

      <HomeMetricCard
        label="Projects · deadline risk"
        value={deadlineRiskCount}
        hint={`Running projects · ngày kết thúc ≤ ${deadlineRiskDays} ngày hoặc quá hạn`}
        icon={<AlertOutlined />}
        tag={
          deadlineRiskCount > 0
            ? { label: 'At risk', variant: 'overdue' }
            : { label: 'Clear', variant: 'completed' }
        }
        footer={renderProjectPreviewFooter(deadlineRiskProjects)}
      />

      {/* TODO(home-capacity-dept): Wire department capacity formula. */}
      <HomeMetricCard
        label="Department capacity"
        value={formatCapacity(departmentCapacityPercent)}
        hint={HOME_PLACEHOLDER_FORMULA_NOTE}
        icon={<ApartmentOutlined />}
        placeholder
        tag={{ label: 'TBD', variant: 'pending' }}
      />

      {/* TODO(home-capacity-company): Wire company-wide capacity formula. */}
      <HomeMetricCard
        label="Company capacity"
        value={formatCapacity(companyCapacityPercent)}
        hint={HOME_PLACEHOLDER_FORMULA_NOTE}
        icon={<GlobalOutlined />}
        placeholder
        tag={{ label: 'TBD', variant: 'pending' }}
      />

      <HomeMetricCard
        label="Tasks hôm nay"
        value={todayTaskCount}
        hint={tasksTodayHint}
        icon={<ClockCircleOutlined />}
        footer={
          <Link to={ROUTES.PROJECT_TASKS} className={styles.link}>
            Mở task list →
          </Link>
        }
      />

      <HomeMetricCard
        label="Tasks by type · hôm nay"
        value={todayTaskCount}
        hint={tasksByTypeHint}
        icon={<UnorderedListOutlined />}
        className={styles.typeCard}
        footer={tasksByTypeFooter}
      />
    </div>
  );
}
