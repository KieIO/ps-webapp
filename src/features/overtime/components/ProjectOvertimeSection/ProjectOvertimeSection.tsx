import { Alert, Button, Empty } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { CreateOvertimeModal } from '../CreateOvertimeModal/CreateOvertimeModal';
import { OvertimeDetailDrawer } from '../OvertimeDetailDrawer/OvertimeDetailDrawer';
import { OvertimeStatusBadge } from '../OvertimeStatusBadge/OvertimeStatusBadge';
import { useOvertimeList } from '../../hooks/useOvertime';
import styles from './ProjectOvertimeSection.module.scss';

interface ProjectOvertimeSectionProps {
  projectId: string;
}

export function ProjectOvertimeSection({ projectId }: ProjectOvertimeSectionProps) {
  const { can } = usePermission();
  const canRequest = can('REQUEST_OT');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data = [], isLoading, isError, refetch } = useOvertimeList({ projectId }, canRequest);

  if (!canRequest) {
    return null;
  }

  return (
    <>
      <CardWrapper
        title="Overtime"
        actions={
          canRequest ? (
            <Button type="primary" size="small" onClick={() => setCreateOpen(true)}>
              Tạo OT
            </Button>
          ) : null
        }
      >
        {isError ? (
          <Alert
            type="error"
            showIcon
            message="Không tải được OT của dự án"
            action={
              <Button size="small" onClick={() => void refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : isLoading ? (
          <p className={styles.muted}>Đang tải...</p>
        ) : data.length === 0 ? (
          <Empty description="Chưa có OT cho dự án này" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <ul className={styles.list}>
            {data.slice(0, 8).map((row) => (
              <li key={row.id}>
                <button type="button" className={styles.item} onClick={() => setDetailId(row.id)}>
                  <div className={styles.itemMain}>
                    <strong>{row.assignee.name || row.assignee.code}</strong>
                    <span className={styles.meta}>
                      {dayjs(row.otDate).format(DATE_FORMAT)} · {row.startTime}–{row.endTime} ·{' '}
                      {row.estimatedHours}h
                    </span>
                  </div>
                  <OvertimeStatusBadge status={row.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardWrapper>

      <CreateOvertimeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultProjectId={projectId}
      />
      <OvertimeDetailDrawer
        overtimeId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}
