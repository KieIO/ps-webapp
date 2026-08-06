import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, DatePicker, Select, Skeleton, Switch } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { buildEmployeePerformancePath } from '@/config/constants';
import type { Role } from '@/config/permissions';
import { useProductivityRanking } from '@/features/productivity/hooks/useProductivityRanking';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { buildTeamComparisonInsights } from '../../utils/buildInsights';
import {
  canSelectDepartment,
  defaultDepartmentScope,
  filterRankingByDepartment,
  rankingDepartmentParam,
  type DepartmentScope,
} from '../../utils/scope';
import {
  MAIN_METRIC_OPTIONS,
  anonymizeName,
  sortRankingByMetric,
  type MainMetricKey,
} from '../../utils/sortRanking';
import { TeamComparisonInsights } from '../TeamComparisonInsights/TeamComparisonInsights';
import { TeamComparisonRadar } from '../TeamComparisonRadar/TeamComparisonRadar';
import { TeamComparisonRankingTable } from '../TeamComparisonRankingTable/TeamComparisonRankingTable';
import styles from './TeamComparisonDashboard.module.scss';

interface TeamComparisonDashboardProps {
  role: Role;
}

export function TeamComparisonDashboard({ role }: TeamComparisonDashboardProps) {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(() => dayjs().startOf('month'));
  const [department, setDepartment] = useState<DepartmentScope>(() => defaultDepartmentScope(role));
  const [mainMetric, setMainMetric] = useState<MainMetricKey>('onTime');
  const [hideNames, setHideNames] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const period = { year: selectedMonth.year(), month: selectedMonth.month() + 1 };
  const rankingQuery = useProductivityRanking(period, {
    department: rankingDepartmentParam(department),
  });
  const monthLabel = selectedMonth.format('M/YYYY');
  const allowDepartmentFilter = canSelectDepartment(role);
  const year = period.year;
  const month = period.month;
  const handleOpenUser = useCallback(
    (userId: string) => {
      navigate(`${buildEmployeePerformancePath(userId)}?year=${year}&month=${month}`);
    },
    [navigate, year, month],
  );
  const scopeHint =
    department === 'all' ? 'toàn bộ phòng ban' : department === 'Project' ? 'Project' : 'Creative';

  const scopedRows = useMemo(() => {
    const ranking = rankingQuery.data?.ranking ?? [];
    return filterRankingByDepartment(ranking, department);
  }, [rankingQuery.data?.ranking, department]);

  const sortedRows = useMemo(
    () => sortRankingByMetric(scopedRows, mainMetric),
    [scopedRows, mainMetric],
  );

  const rankedRows = useMemo(
    () =>
      sortedRows.map((row, index) => {
        const rank = index + 1;
        return {
          ...row,
          rank,
          displayName: hideNames ? anonymizeName(rank) : row.name,
        };
      }),
    [sortedRows, hideNames],
  );

  useEffect(() => {
    if (rankedRows.length === 0) {
      setSelectedUserId(null);
      return;
    }
    if (!selectedUserId || !rankedRows.some((row) => row.userId === selectedUserId)) {
      setSelectedUserId(rankedRows[0].userId);
    }
  }, [rankedRows, selectedUserId]);

  const displayName = (row: { userId: string; name: string }) => {
    const ranked = rankedRows.find((r) => r.userId === row.userId);
    return ranked?.displayName ?? row.name;
  };

  const insights = useMemo(
    () => buildTeamComparisonInsights(sortedRows, monthLabel, hideNames),
    [sortedRows, monthLabel, hideNames],
  );

  return (
    <div className={styles.root}>
      <PageHeader
        breadcrumb={[{ label: 'Reports' }, { label: 'So sánh nhóm' }]}
        title="So sánh nhóm"
        subtitle="Capacity, tiến độ và chất lượng — nhóm vs cá nhân"
        actions={
          <DatePicker
            picker="month"
            allowClear={false}
            value={selectedMonth}
            format="[Tháng] M/YYYY"
            onChange={(value) => {
              if (value) setSelectedMonth(value.startOf('month'));
            }}
            aria-label="Chọn tháng báo cáo"
          />
        }
      />

      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Hiển thị</span>
        <Select<MainMetricKey>
          className={styles.filterControl}
          value={mainMetric}
          onChange={setMainMetric}
          options={MAIN_METRIC_OPTIONS}
          aria-label="Chỉ số chính để xếp hạng"
          popupMatchSelectWidth={false}
        />
        {allowDepartmentFilter ? (
          <Select<DepartmentScope>
            className={styles.filterControl}
            value={department}
            onChange={setDepartment}
            options={[
              { value: 'all', label: 'Tất cả phòng ban' },
              { value: 'Project', label: 'Project' },
              { value: 'Creative', label: 'Creative' },
            ]}
            aria-label="Lọc phòng ban"
          />
        ) : null}
        <label className={styles.hideNames}>
          <span>Ẩn tên</span>
          <Switch
            size="small"
            checked={hideNames}
            onChange={setHideNames}
            aria-label="Ẩn tên nhân viên"
          />
        </label>
        {!rankingQuery.isLoading && rankedRows.length > 0 ? (
          <span className={styles.resultCount}>
            {rankedRows.length} người · {scopeHint}
          </span>
        ) : null}
      </div>

      {rankingQuery.isError && (
        <Alert
          type="error"
          showIcon
          message="Không tải được dữ liệu"
          description="Thử lại nhé."
          action={
            <Button size="small" onClick={() => void rankingQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      {rankingQuery.isLoading ? (
        <div className={styles.loading}>
          <Skeleton active paragraph={{ rows: 8 }} />
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : (
        <>
          <TeamComparisonRadar
            rows={sortedRows}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
            displayName={displayName}
          />
          <TeamComparisonRankingTable
            rows={rankedRows}
            mainMetric={mainMetric}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
            onOpenUser={handleOpenUser}
            monthLabel={monthLabel}
          />
          <TeamComparisonInsights monthLabel={monthLabel} insights={insights} />
        </>
      )}
    </div>
  );
}
