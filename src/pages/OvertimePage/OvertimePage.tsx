import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { usePermission } from '@/shared/hooks/usePermission';
import { useDebounce } from 'use-debounce';
import { ROLES } from '@/config/permissions';
import { useProjectList } from '@/features/projects/hooks/useProjectList';
import { useUserList } from '@/features/users/hooks/useUserList';
import { CreateOvertimeModal } from '@/features/overtime/components/CreateOvertimeModal/CreateOvertimeModal';
import { EditOvertimeModal } from '@/features/overtime/components/EditOvertimeModal/EditOvertimeModal';
import { OvertimeDashboardTab } from '@/features/overtime/components/OvertimeDashboardTab/OvertimeDashboardTab';
import { OvertimeDetailDrawer } from '@/features/overtime/components/OvertimeDetailDrawer/OvertimeDetailDrawer';
import { OvertimeFilters } from '@/features/overtime/components/OvertimeFilters/OvertimeFilters';
import { OvertimeTable } from '@/features/overtime/components/OvertimeTable/OvertimeTable';
import { useOvertimeList, useOvertimeProjectOptions } from '@/features/overtime/hooks/useOvertime';
import type {
  OvertimeListFilters,
  OvertimeRecord,
} from '@/features/overtime/schemas/overtime.schema';
import styles from './OvertimePage.module.scss';

export default function OvertimePage() {
  const { can } = usePermission();
  const canRequest = can('REQUEST_OT');
  const canApprove = can('APPROVE_OT');
  const canAccessHub = canRequest || canApprove;
  const [searchParams, setSearchParams] = useSearchParams();
  const detailId = searchParams.get('id');

  const [filters, setFilters] = useState<OvertimeListFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<OvertimeRecord | null>(null);
  const [debouncedSearch] = useDebounce(filters.search, 300);

  const hasDateRange = Boolean(filters.fromDate && filters.toDate);

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  );

  const listQuery = useOvertimeList(queryFilters, canAccessHub);
  const { data: projectList } = useProjectList({});
  const scopedProjectsQuery = useOvertimeProjectOptions(
    filters.fromDate,
    filters.toDate,
    canAccessHub && hasDateRange,
  );
  const { data: staffList } = useUserList({ role: ROLES.EMPLOYEE, status: 'active' });

  const projectOptions = useMemo(() => {
    const source = hasDateRange ? (scopedProjectsQuery.data ?? []) : (projectList?.items ?? []);
    return source.map((project) => ({
      value: project.id,
      label: project.name || ('code' in project ? project.code : '') || project.id,
    }));
  }, [hasDateRange, scopedProjectsQuery.data, projectList?.items]);

  const assigneeOptions = useMemo(
    () =>
      (staffList?.items ?? []).map((user) => ({
        value: user.id,
        label: user.name,
      })),
    [staffList?.items],
  );

  useEffect(() => {
    if (!filters.projectId || !hasDateRange) return;
    if (scopedProjectsQuery.isLoading || scopedProjectsQuery.isFetching) return;
    const stillValid = projectOptions.some((option) => option.value === filters.projectId);
    if (!stillValid) {
      setFilters((prev) => ({ ...prev, projectId: undefined }));
    }
  }, [
    filters.projectId,
    hasDateRange,
    projectOptions,
    scopedProjectsQuery.isLoading,
    scopedProjectsQuery.isFetching,
  ]);

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
        projectOptionsLoading={hasDateRange && scopedProjectsQuery.isFetching}
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
        onEdit={(record) => setEditRecord(record)}
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
      <EditOvertimeModal
        open={Boolean(editRecord)}
        record={editRecord}
        onClose={() => setEditRecord(null)}
      />
      <OvertimeDetailDrawer overtimeId={detailId} open={Boolean(detailId)} onClose={closeDetail} />
    </div>
  );
}
