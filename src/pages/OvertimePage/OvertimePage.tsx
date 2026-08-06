import { useMemo, useState } from 'react';
import { Alert, Button, Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { usePermission } from '@/shared/hooks/usePermission';
import { useDebounce } from 'use-debounce';
import { ROLES } from '@/config/permissions';
import { useProjectList } from '@/features/projects/hooks/useProjectList';
import { useUserList } from '@/features/users/hooks/useUserList';
import { CreateOvertimeModal } from '@/features/overtime/components/CreateOvertimeModal/CreateOvertimeModal';
import { OvertimeDashboardTab } from '@/features/overtime/components/OvertimeDashboardTab/OvertimeDashboardTab';
import { OvertimeDetailDrawer } from '@/features/overtime/components/OvertimeDetailDrawer/OvertimeDetailDrawer';
import { OvertimeFilters } from '@/features/overtime/components/OvertimeFilters/OvertimeFilters';
import { OvertimeTable } from '@/features/overtime/components/OvertimeTable/OvertimeTable';
import { useOvertimeList } from '@/features/overtime/hooks/useOvertime';
import type { OvertimeListFilters } from '@/features/overtime/schemas/overtime.schema';
import styles from './OvertimePage.module.scss';

export default function OvertimePage() {
  const { can } = usePermission();
  const canRequest = can('REQUEST_OT');
  const canApprove = can('APPROVE_OT');
  const [searchParams, setSearchParams] = useSearchParams();
  const detailId = searchParams.get('id');

  const [filters, setFilters] = useState<OvertimeListFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [debouncedSearch] = useDebounce(filters.search, 300);

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  );

  const listQuery = useOvertimeList(queryFilters, canRequest || canApprove);
  const { data: projectList } = useProjectList({});
  const { data: staffList } = useUserList({ role: ROLES.EMPLOYEE, status: 'active' });

  const projectOptions = useMemo(
    () =>
      (projectList?.items ?? []).map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [projectList?.items],
  );

  const assigneeOptions = useMemo(
    () =>
      (staffList?.items ?? []).map((user) => ({
        value: user.id,
        label: user.name,
      })),
    [staffList?.items],
  );

  const openDetail = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('id', id);
      return next;
    });
  };

  const closeDetail = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('id');
      return next;
    });
  };

  const requestsTab = (
    <div className={styles.requests}>
      <OvertimeFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
        projectOptions={projectOptions}
        assigneeOptions={assigneeOptions}
      />

      {listQuery.isError ? (
        <Alert
          type="error"
          showIcon
          className={styles.alert}
          message="Không tải được danh sách OT"
          action={
            <Button size="small" onClick={() => void listQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      <OvertimeTable
        records={listQuery.data ?? []}
        loading={listQuery.isLoading}
        onRowClick={(record) => openDetail(record.id)}
      />
    </div>
  );

  return (
    <div className={styles.root}>
      <PageHeader
        title="Overtime"
        subtitle="Quản lý OT request, duyệt và theo dõi kết quả"
        actions={
          canRequest ? (
            <Button type="primary" onClick={() => setCreateOpen(true)}>
              Tạo OT Request
            </Button>
          ) : null
        }
      />

      <Tabs
        items={[
          { key: 'requests', label: 'Requests', children: requestsTab },
          { key: 'dashboard', label: 'Dashboard', children: <OvertimeDashboardTab /> },
        ]}
      />

      <CreateOvertimeModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <OvertimeDetailDrawer overtimeId={detailId} open={Boolean(detailId)} onClose={closeDetail} />
    </div>
  );
}
