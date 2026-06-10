import { Avatar, Button } from 'antd';
import { ArrowRightOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { EvaluationLevelBadge } from '../EvaluationLevelBadge/EvaluationLevelBadge';
import { ProjectStatusBadge } from '../ProjectStatusBadge/ProjectStatusBadge';
import { getInitials } from '@/shared/utils/person';
import type { EvaluationLevel, Project } from '../../schemas/project.schema';
import styles from './ProjectSummaryCard.module.scss';

interface ProjectSummaryCardProps {
  project: Project;
  onEdit?: () => void;
}

export function ProjectSummaryCard({ project, onEdit }: ProjectSummaryCardProps) {
  const { can } = usePermission();
  const canEdit = can('EDIT_PROJECT');

  return (
    <section className={styles.card}>
      <div className={styles.layout}>
        <div>
          <h2 className={styles.name}>{project.name}</h2>
          <dl className={styles.metaList}>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Client</dt>
              <dd className={styles.metaValue}>{project.client}</dd>
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
                <span className={styles.pmCell}>
                  <Avatar size={28} className={styles.avatar}>
                    {getInitials(project.pm.name)}
                  </Avatar>
                  {project.pm.name}
                </span>
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
              <dd className={styles.metaValue}>{project.departmentHead.name}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Status</dt>
              <dd className={styles.metaValue}>
                <ProjectStatusBadge status={project.status} />
              </dd>
            </div>
          </dl>
        </div>

        <div className={styles.actions}>
          {canEdit && onEdit && (
            <Button icon={<EditOutlined />} onClick={onEdit}>
              Edit
            </Button>
          )}
          <Button icon={<ArrowRightOutlined />} disabled title="Coming soon">
            Handover
          </Button>
        </div>
      </div>
    </section>
  );
}
