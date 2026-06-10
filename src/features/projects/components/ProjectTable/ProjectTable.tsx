import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { buildProjectDetailPath, DATE_FORMAT } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { CompletionProgressCell } from '@/shared/ui/CompletionProgressCell/CompletionProgressCell';
import { PersonAvatarCell } from '@/shared/ui/PersonAvatarCell/PersonAvatarCell';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { EvaluationLevelBadge } from '../EvaluationLevelBadge/EvaluationLevelBadge';
import { ProjectStatusBadge } from '../ProjectStatusBadge/ProjectStatusBadge';
import {
  PROJECT_EVALUATION_COLUMN_HEADERS,
  PROJECTS_PAGE_SIZE,
  PROJECTS_PAGE_SIZE_OPTIONS,
  STATUS_VARIANT,
} from '../../constants';
import { DepartmentBadge } from '../DepartmentBadge/DepartmentBadge';
import { ProjectUrgencyBadge } from '../ProjectUrgencyBadge/ProjectUrgencyBadge';
import type { EvaluationLevel, Project } from '../../schemas/project.schema';
import styles from './ProjectTable.module.scss';

interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  total: number;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  deletingProjectId?: string | null;
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

export function ProjectTable({
  projects,
  loading,
  total,
  onEdit,
  onDelete,
  deletingProjectId = null,
}: ProjectTableProps) {
  const navigate = useNavigate();
  const { can } = usePermission();
  const canEdit = can('EDIT_PROJECT');
  const actionsWidth = canEdit ? 108 : 72;
  const scrollX = 3080 + actionsWidth;

  const columns: ColumnsType<Project> = [
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      width: 110,
      fixed: 'left',
    },
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string, record) => (
        <Button type="link" onClick={() => navigate(buildProjectDetailPath(record.id))}>
          {name}
        </Button>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: (department: Project['department']) => <DepartmentBadge department={department} />,
    },
    {
      title: 'Tasks',
      dataIndex: 'taskCount',
      key: 'taskCount',
      width: 80,
      align: 'right',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      render: (date: string) => dayjs(date).format(DATE_FORMAT),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 110,
      render: (date: string) => dayjs(date).format(DATE_FORMAT),
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 120,
      render: (urgency: Project['urgency']) => <ProjectUrgencyBadge urgency={urgency} />,
    },
    {
      title: 'Project Level',
      dataIndex: 'projectLevel',
      key: 'projectLevel',
      width: 110,
      align: 'center',
      render: (level: EvaluationLevel) => renderLevel(level),
    },
    {
      title: 'Head Name',
      key: 'departmentHeadName',
      width: 150,
      render: (_, record) => record.departmentHead.name,
    },
    {
      title: 'Brief',
      dataIndex: 'brief',
      key: 'brief',
      width: 220,
      ellipsis: true,
      render: renderText,
    },
    {
      title: PROJECT_EVALUATION_COLUMN_HEADERS.volume,
      dataIndex: 'volume',
      key: 'volume',
      width: 110,
      render: renderLevel,
    },
    {
      title: PROJECT_EVALUATION_COLUMN_HEADERS.nature,
      dataIndex: 'nature',
      key: 'nature',
      width: 110,
      render: renderLevel,
    },
    {
      title: PROJECT_EVALUATION_COLUMN_HEADERS.time,
      dataIndex: 'time',
      key: 'time',
      width: 110,
      render: renderLevel,
    },
    {
      title: PROJECT_EVALUATION_COLUMN_HEADERS.additionalFactors,
      dataIndex: 'additionalFactors',
      key: 'additionalFactors',
      width: 200,
      ellipsis: true,
      render: renderText,
    },
    {
      title: 'PM Name',
      key: 'pmName',
      width: 170,
      render: (_, record) => <PersonAvatarCell name={record.pm.name} />,
    },
    {
      title: 'Members',
      key: 'members',
      width: 180,
      ellipsis: true,
      render: (_, record) => {
        const label = record.members.map((member) => member.name).join(', ');
        if (!label) return <span className={styles.empty}>—</span>;
        return (
          <Tooltip title={label}>
            <span className={styles.members}>{label}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Slides',
      dataIndex: 'totalSlides',
      key: 'totalSlides',
      width: 80,
      align: 'right',
    },
    {
      title: '% Hoàn Thành',
      dataIndex: 'completionPercent',
      key: 'completionPercent',
      width: 160,
      render: (percent: number, record) => (
        <CompletionProgressCell
          percent={percent}
          variant={STATUS_VARIANT[record.status]}
        />
      ),
    },
    {
      title: 'Đánh Giá',
      dataIndex: 'evaluation',
      key: 'evaluation',
      width: 120,
      render: renderText,
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      width: 180,
      ellipsis: true,
      render: renderText,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: Project['status']) => <ProjectStatusBadge status={status} />,
    },
    {
      title: 'Finished Date',
      dataIndex: 'finishedDate',
      key: 'finishedDate',
      width: 120,
      render: (date?: string) =>
        date ? dayjs(date).format(DATE_FORMAT) : <span className={styles.empty}>—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: actionsWidth,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.actions}>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              aria-label={`View ${record.name}`}
              onClick={() => navigate(buildProjectDetailPath(record.id))}
            />
          </Tooltip>
          {canEdit && onEdit ? (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label={`Edit ${record.name}`}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          ) : null}
          {onDelete ? (
            <Popconfirm
              title="Delete this project?"
              description="This action cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              onConfirm={() => onDelete(record)}
            >
              <Tooltip title="Delete">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`Delete ${record.name}`}
                  loading={deletingProjectId === record.id}
                  disabled={deletingProjectId != null && deletingProjectId !== record.id}
                />
              </Tooltip>
            </Popconfirm>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && projects.length === 0}
      emptyTitle="No projects found"
      emptyDescription="Try adjusting your search or filters."
    >
      <Table
        className={styles.table}
        rowKey="id"
        columns={columns}
        dataSource={projects}
        scroll={{ x: scrollX }}
        pagination={{
          pageSize: PROJECTS_PAGE_SIZE,
          total,
          showSizeChanger: true,
          pageSizeOptions: [...PROJECTS_PAGE_SIZE_OPTIONS],
          showTotal: (count, range) =>
            `Showing ${range[0]}-${range[1]} / ${count} projects`,
        }}
      />
    </TableWrapper>
  );
}
