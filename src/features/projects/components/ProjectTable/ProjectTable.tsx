import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  RollbackOutlined,
  StarOutlined,
  SyncOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { PROJECT_NAME_COLUMN_LABEL } from '../../constants';
import { ProjectNameLink } from '@/shared/ui/ProjectNameLink/ProjectNameLink';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import { CompletionProgressCell } from '@/shared/ui/CompletionProgressCell/CompletionProgressCell';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { EvaluationLevelBadge } from '../EvaluationLevelBadge/EvaluationLevelBadge';
import { ProjectStatusBadge } from '../ProjectStatusBadge/ProjectStatusBadge';
import { canEditProjectMeta } from '../../utils/projectEditAuth';
import {
  PROJECT_EVALUATION_COLUMN_HEADERS,
  PROJECT_TABLE_COLUMN_HEADERS,
  PROJECTS_PAGE_SIZE,
  PROJECTS_PAGE_SIZE_OPTIONS,
  STATUS_VARIANT,
} from '../../constants';
import { DepartmentBadge } from '../DepartmentBadge/DepartmentBadge';
import { ProjectUrgencyBadge } from '../ProjectUrgencyBadge/ProjectUrgencyBadge';
import { ProjectUrgencyColumnTitle } from '../ProjectUrgencyHelpTooltip/ProjectUrgencyHelpTooltip';
import { ProjectMembersCell } from '../ProjectMembersCell/ProjectMembersCell';
import {
  PROJECT_DEPARTMENTS,
  PROJECT_STATUSES,
  PROJECT_URGENCY_COLORS,
  type EvaluationLevel,
  type Project,
} from '../../schemas/project.schema';
import { getProjectActionsWidth } from '../../utils/projectActionsWidth';
import { resolveProjectUrgencyDisplay } from '../../utils/resolveProjectUrgencyDisplay';
import styles from './ProjectTable.module.scss';

const compareText = (a: string, b: string) => a.localeCompare(b, 'vi');

const compareNumber = (a: number, b: number) => a - b;

const compareEnumIndex = <T extends string>(values: readonly T[], a: T, b: T) =>
  values.indexOf(a) - values.indexOf(b);

const compareDate = (a: string, b: string) => dayjs(a).unix() - dayjs(b).unix();

const compareOptionalDate = (a?: string, b?: string) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return compareDate(a, b);
};

const compareMembers = (a: Project, b: Project) =>
  compareText(
    a.members.map((member) => member.name).join(', '),
    b.members.map((member) => member.name).join(', '),
  );

const archiveConfirmDescription = (project: Project): string => {
  if (project.status === 'finish' || project.status === 'cancel') {
    return 'Dự án sẽ chuyển sang danh sách đã lưu trữ. Bạn có thể khôi phục lại sau.';
  }
  return 'Dự án này chưa hoàn thành hoặc hủy. Vẫn có thể lưu trữ và khôi phục lại sau.';
};

interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  total: number;
  /** When true, shows unarchive instead of archive and hides day-to-day edit actions. */
  archivedView?: boolean;
  onUpdateStatus?: (project: Project) => void;
  onAssign?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onEvaluate?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onUnarchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  deletingProjectId?: string | null;
  archivingProjectId?: string | null;
  unarchivingProjectId?: string | null;
}

const renderLevel = (level: EvaluationLevel) => <EvaluationLevelBadge level={level} />;

const renderText = (value: string) => {
  if (!value) return <span className={styles.empty}>—</span>;
  return (
    <Tooltip title={value}>
      <span className={styles.truncate}>{value}</span>
    </Tooltip>
  );
};

const renderWrapText = (value: string) => {
  if (!value) return <span className={styles.empty}>—</span>;
  return <span className={styles.wrapText}>{value}</span>;
};

export function ProjectTable({
  projects,
  loading,
  total,
  archivedView = false,
  onUpdateStatus,
  onAssign,
  onEdit,
  onEvaluate,
  onArchive,
  onUnarchive,
  onDelete,
  deletingProjectId = null,
  archivingProjectId = null,
  unarchivingProjectId = null,
}: ProjectTableProps) {
  const { can, role } = usePermission();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const canEdit = can('EDIT_PROJECT') && !archivedView;
  const canArchive = can('ARCHIVE_PROJECT');
  const canDelete = can('DELETE_PROJECT');
  const canEditMeta = (project: Project) => canEdit && canEditProjectMeta(project, role, userId);
  const actionsWidth = getProjectActionsWidth({
    hasUpdateStatus: canEdit && Boolean(onUpdateStatus),
    canAssign: canEdit && Boolean(onAssign),
    hasEdit: canEdit && Boolean(onEdit),
    canEvaluate: canEdit && Boolean(onEvaluate),
    hasArchive: canArchive && !archivedView && Boolean(onArchive),
    hasUnarchive: canArchive && archivedView && Boolean(onUnarchive),
    hasDelete: canDelete && Boolean(onDelete),
  });
  const scrollX = 3150 + actionsWidth;
  const emptyTitle = archivedView ? 'Không có dự án đã lưu trữ' : 'Không tìm thấy dự án';
  const emptyDescription = archivedView
    ? 'Các dự án đã lưu trữ sẽ hiện ở đây.'
    : 'Thử điều chỉnh tìm kiếm hoặc bộ lọc.';

  const columns: ColumnsType<Project> = [
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.client,
      dataIndex: 'client',
      key: 'client',
      width: 110,
      fixed: 'left',
      render: (client: Project['client']) => renderText(client?.name ?? ''),
      sorter: (a, b) => compareText(a.client.name, b.client.name),
    },
    {
      title: PROJECT_NAME_COLUMN_LABEL,
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a, b) => compareText(a.name, b.name),
      render: (name: string, record) => (
        <ProjectNameLink name={name} projectId={record.id} emptyClassName={styles.empty} />
      ),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.department,
      dataIndex: 'department',
      key: 'department',
      width: 130,
      sorter: (a, b) => compareEnumIndex(PROJECT_DEPARTMENTS, a.department, b.department),
      render: (department: Project['department']) => <DepartmentBadge department={department} />,
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.tasks,
      dataIndex: 'taskCount',
      key: 'taskCount',
      width: 90,
      align: 'right',
      sorter: (a, b) => compareNumber(a.taskCount, b.taskCount),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.startDate,
      dataIndex: 'startDate',
      key: 'startDate',
      width: 125,
      sorter: (a, b) => compareDate(a.startDate, b.startDate),
      render: (date: string) => dayjs(date).format(DATE_FORMAT),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.endDate,
      dataIndex: 'endDate',
      key: 'endDate',
      width: 110,
      sorter: (a, b) => compareDate(a.endDate, b.endDate),
      render: (date: string) => dayjs(date).format(DATE_FORMAT),
    },
    {
      title: <ProjectUrgencyColumnTitle />,
      dataIndex: 'urgency',
      key: 'urgency',
      width: 135,
      sorter: (a, b) =>
        compareEnumIndex(
          PROJECT_URGENCY_COLORS,
          resolveProjectUrgencyDisplay(a),
          resolveProjectUrgencyDisplay(b),
        ),
      showSorterTooltip: false,
      render: (_: Project['urgency'], record) => (
        <ProjectUrgencyBadge urgency={resolveProjectUrgencyDisplay(record)} />
      ),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.level,
      dataIndex: 'projectLevel',
      key: 'projectLevel',
      width: 110,
      align: 'center',
      sorter: (a, b) => compareNumber(a.projectLevel, b.projectLevel),
      render: (level: EvaluationLevel) => renderLevel(level),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.headName,
      key: 'departmentHeadName',
      width: 150,
      sorter: (a, b) => compareText(a.departmentHead.name, b.departmentHead.name),
      render: (_, record) => (
        <UserNameLink name={record.departmentHead.name} userId={record.departmentHead.userId} />
      ),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.brief,
      dataIndex: 'brief',
      key: 'brief',
      width: 220,
      sorter: (a, b) => compareText(a.brief, b.brief),
      render: renderWrapText,
    },
    {
      title: PROJECT_EVALUATION_COLUMN_HEADERS.volume,
      dataIndex: 'volume',
      key: 'volume',
      width: 110,
      sorter: (a, b) => compareNumber(a.volume, b.volume),
      render: renderLevel,
    },
    {
      title: PROJECT_EVALUATION_COLUMN_HEADERS.nature,
      dataIndex: 'nature',
      key: 'nature',
      width: 110,
      sorter: (a, b) => compareNumber(a.nature, b.nature),
      render: renderLevel,
    },
    {
      title: PROJECT_EVALUATION_COLUMN_HEADERS.time,
      dataIndex: 'time',
      key: 'time',
      width: 110,
      sorter: (a, b) => compareNumber(a.time, b.time),
      render: renderLevel,
    },
    {
      title: PROJECT_EVALUATION_COLUMN_HEADERS.additionalFactors,
      dataIndex: 'additionalFactors',
      key: 'additionalFactors',
      width: 200,
      ellipsis: true,
      sorter: (a, b) => compareText(a.additionalFactors, b.additionalFactors),
      render: renderText,
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.pmName,
      key: 'pmName',
      width: 170,
      sorter: (a, b) => compareText(a.pm.name, b.pm.name),
      render: (_, record) => (
        <UserNameLink name={record.pm.name} userId={record.pm.userId} showAvatar />
      ),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.members,
      key: 'members',
      width: 180,
      sorter: compareMembers,
      render: (_, record) => (
        <ProjectMembersCell members={record.members} emptyClassName={styles.empty} />
      ),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.slides,
      dataIndex: 'totalSlides',
      key: 'totalSlides',
      width: 80,
      align: 'right',
      sorter: (a, b) => compareNumber(a.totalSlides, b.totalSlides),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.completion,
      dataIndex: 'completionPercent',
      key: 'completionPercent',
      width: 160,
      sorter: (a, b) => compareNumber(a.completionPercent, b.completionPercent),
      render: (percent: number, record) => (
        <CompletionProgressCell percent={percent} variant={STATUS_VARIANT[record.status]} />
      ),
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.evaluation,
      dataIndex: 'evaluation',
      key: 'evaluation',
      width: 120,
      sorter: (a, b) => compareText(a.evaluation, b.evaluation),
      render: renderText,
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.note,
      dataIndex: 'note',
      key: 'note',
      width: 180,
      sorter: (a, b) => compareText(a.note, b.note),
      render: renderWrapText,
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.status,
      dataIndex: 'status',
      key: 'status',
      width: 130,
      sorter: (a, b) => compareEnumIndex(PROJECT_STATUSES, a.status, b.status),
      render: (status: Project['status']) => <ProjectStatusBadge status={status} />,
    },
    {
      title: PROJECT_TABLE_COLUMN_HEADERS.finishedDate,
      dataIndex: 'finishedDate',
      key: 'finishedDate',
      width: 140,
      sorter: (a, b) => compareOptionalDate(a.finishedDate, b.finishedDate),
      render: (date?: string) =>
        date ? dayjs(date).format(DATE_FORMAT) : <span className={styles.empty}>—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: actionsWidth,
      fixed: 'right',
      render: (_, record) => {
        const busyId = deletingProjectId ?? archivingProjectId ?? unarchivingProjectId ?? null;
        const isBusy = busyId != null;
        const isThisBusy =
          deletingProjectId === record.id ||
          archivingProjectId === record.id ||
          unarchivingProjectId === record.id;

        return (
          <div className={styles.actions}>
            {canEdit && onUpdateStatus ? (
              <Tooltip title="Update status">
                <Button
                  type="text"
                  icon={<SyncOutlined />}
                  aria-label={`Update status for ${record.name}`}
                  onClick={() => onUpdateStatus(record)}
                  disabled={isBusy && !isThisBusy}
                />
              </Tooltip>
            ) : null}
            {canEdit && onAssign ? (
              <Tooltip title="Assign staff">
                <Button
                  type="text"
                  icon={<UserAddOutlined />}
                  aria-label={`Assign staff for ${record.name}`}
                  onClick={() => onAssign(record)}
                  disabled={isBusy && !isThisBusy}
                />
              </Tooltip>
            ) : null}
            {canEditMeta(record) && onEdit ? (
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  aria-label={`Edit ${record.name}`}
                  onClick={() => onEdit(record)}
                  disabled={isBusy && !isThisBusy}
                />
              </Tooltip>
            ) : null}
            {canEdit && onEvaluate ? (
              <Tooltip title="Evaluate">
                <Button
                  type="text"
                  icon={<StarOutlined />}
                  aria-label={`Evaluate ${record.name}`}
                  onClick={() => onEvaluate(record)}
                  disabled={isBusy && !isThisBusy}
                />
              </Tooltip>
            ) : null}
            {canArchive && !archivedView && onArchive ? (
              <Popconfirm
                title="Lưu trữ dự án này?"
                description={archiveConfirmDescription(record)}
                okText="Lưu trữ"
                cancelText="Hủy"
                onConfirm={() => onArchive(record)}
              >
                <Tooltip title="Lưu trữ">
                  <Button
                    type="text"
                    icon={<InboxOutlined />}
                    aria-label={`Archive ${record.name}`}
                    loading={archivingProjectId === record.id}
                    disabled={isBusy && !isThisBusy}
                  />
                </Tooltip>
              </Popconfirm>
            ) : null}
            {canArchive && archivedView && onUnarchive ? (
              <Popconfirm
                title="Khôi phục dự án này?"
                description="Dự án sẽ quay lại danh sách đang hoạt động."
                okText="Khôi phục"
                cancelText="Hủy"
                onConfirm={() => onUnarchive(record)}
              >
                <Tooltip title="Khôi phục">
                  <Button
                    type="text"
                    icon={<RollbackOutlined />}
                    aria-label={`Unarchive ${record.name}`}
                    loading={unarchivingProjectId === record.id}
                    disabled={isBusy && !isThisBusy}
                  />
                </Tooltip>
              </Popconfirm>
            ) : null}
            {canDelete && onDelete ? (
              <Popconfirm
                title="Xóa dự án này?"
                description="Hành động này không thể hoàn tác."
                okText="Xóa"
                okButtonProps={{ danger: true }}
                cancelText="Hủy"
                onConfirm={() => onDelete(record)}
              >
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${record.name}`}
                    loading={deletingProjectId === record.id}
                    disabled={isBusy && !isThisBusy}
                  />
                </Tooltip>
              </Popconfirm>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && projects.length === 0}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    >
      <Table
        className={styles.table}
        rowKey="id"
        columns={columns}
        dataSource={projects}
        scroll={{ x: scrollX }}
        pagination={{
          defaultPageSize: PROJECTS_PAGE_SIZE,
          total,
          showSizeChanger: true,
          pageSizeOptions: [...PROJECTS_PAGE_SIZE_OPTIONS],
          showTotal: (count, range) => `Hiển thị ${range[0]}-${range[1]} / ${count} dự án`,
        }}
      />
    </TableWrapper>
  );
}
