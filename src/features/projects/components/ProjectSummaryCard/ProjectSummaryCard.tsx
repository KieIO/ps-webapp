import { Button, Popconfirm, Tag } from 'antd';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import { EvaluationLevelBadge } from '../EvaluationLevelBadge/EvaluationLevelBadge';
import { ProjectStatusBadge } from '../ProjectStatusBadge/ProjectStatusBadge';
import type { EvaluationLevel, Project } from '../../schemas/project.schema';
import styles from './ProjectSummaryCard.module.scss';

interface ProjectSummaryCardProps {
  project: Project;
  onEdit?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  isArchiving?: boolean;
  isUnarchiving?: boolean;
}

export function ProjectSummaryCard({
  project,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  isDeleting = false,
  isArchiving = false,
  isUnarchiving = false,
}: ProjectSummaryCardProps) {
  const { can } = usePermission();
  const canEdit = can('EDIT_PROJECT');
  const canArchive = can('ARCHIVE_PROJECT');
  const canDelete = can('DELETE_PROJECT');
  const isArchived = Boolean(project.archivedAt);

  return (
    <section className={styles.card}>
      <div className={styles.layout}>
        <div>
          <h2 className={styles.name}>
            {project.name}
            {isArchived ? (
              <Tag style={{ marginLeft: 8 }} color="default">
                Đã lưu trữ
              </Tag>
            ) : null}
          </h2>
          <dl className={styles.metaList}>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Client</dt>
              <dd className={styles.metaValue}>{project.client.name}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Project Code</dt>
              <dd className={styles.metaValue}>{project.code}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Project Level</dt>
              <dd className={styles.metaValue}>
                <EvaluationLevelBadge level={project.projectLevel as EvaluationLevel} />
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <dl className={styles.metaList}>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>PM in Charge</dt>
              <dd className={styles.metaValue}>
                <UserNameLink name={project.pm.name} userId={project.pm.userId} showAvatar />
              </dd>
            </div>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Start Date</dt>
              <dd className={styles.metaValue}>{dayjs(project.startDate).format(DATE_FORMAT)}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>End Date</dt>
              <dd className={styles.metaValue}>{dayjs(project.endDate).format(DATE_FORMAT)}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Dept. Head</dt>
              <dd className={styles.metaValue}>
                <UserNameLink
                  name={project.departmentHead.name}
                  userId={project.departmentHead.userId}
                />
              </dd>
            </div>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Status</dt>
              <dd className={styles.metaValue}>
                <ProjectStatusBadge status={project.status} />
              </dd>
            </div>
            {isArchived && project.archivedAt ? (
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>Archived</dt>
                <dd className={styles.metaValue}>
                  {dayjs(project.archivedAt).format(DATE_FORMAT)}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className={styles.actions}>
          {canEdit && onEdit && !isArchived ? (
            <Button icon={<EditOutlined />} onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          {canArchive && !isArchived && onArchive ? (
            <Popconfirm
              title="Lưu trữ dự án này?"
              description={
                project.status === 'finish' || project.status === 'cancel'
                  ? 'Dự án sẽ chuyển sang danh sách đã lưu trữ. Bạn có thể khôi phục lại sau.'
                  : 'Dự án này chưa hoàn thành hoặc hủy. Vẫn có thể lưu trữ và khôi phục lại sau.'
              }
              okText="Lưu trữ"
              cancelText="Hủy"
              onConfirm={onArchive}
            >
              <Button icon={<InboxOutlined />} loading={isArchiving}>
                Lưu trữ
              </Button>
            </Popconfirm>
          ) : null}
          {canArchive && isArchived && onUnarchive ? (
            <Popconfirm
              title="Khôi phục dự án này?"
              description="Dự án sẽ quay lại danh sách đang hoạt động."
              okText="Khôi phục"
              cancelText="Hủy"
              onConfirm={onUnarchive}
            >
              <Button icon={<RollbackOutlined />} loading={isUnarchiving}>
                Khôi phục
              </Button>
            </Popconfirm>
          ) : null}
          {canDelete && onDelete ? (
            <Popconfirm
              title="Xóa dự án này?"
              description="Hành động này không thể hoàn tác."
              okText="Xóa"
              okButtonProps={{ danger: true }}
              cancelText="Hủy"
              onConfirm={onDelete}
            >
              <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
                Delete
              </Button>
            </Popconfirm>
          ) : null}
          <Button icon={<ArrowRightOutlined />} disabled title="Coming soon">
            Handover
          </Button>
        </div>
      </div>
    </section>
  );
}
