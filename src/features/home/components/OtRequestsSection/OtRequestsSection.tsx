import { Button, Empty, Input, Modal, Spin } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import {
  useApproveOvertime,
  usePendingOvertime,
  useRejectOvertime,
} from '@/features/overtime/hooks/useOvertime';
import styles from './OtRequestsSection.module.scss';

export function OtRequestsSection() {
  const { data = [], isLoading, isError, refetch } = usePendingOvertime(true);
  const approveMutation = useApproveOvertime();
  const rejectMutation = useRejectOvertime();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (!rejectId || !rejectReason.trim()) return;
    rejectMutation.mutate(
      { id: rejectId, payload: { reason: rejectReason.trim() } },
      {
        onSuccess: () => {
          setRejectId(null);
          setRejectReason('');
        },
      },
    );
  };

  return (
    <>
      <CardWrapper title="OT requests chờ duyệt" className={styles.card}>
        {isLoading ? (
          <div className={styles.loading}>
            <Spin size="small" />
          </div>
        ) : isError ? (
          <div className={styles.error}>
            <span>Không tải được danh sách OT chờ duyệt.</span>
            <Button size="small" onClick={() => void refetch()}>
              Thử lại
            </Button>
          </div>
        ) : data.length === 0 ? (
          <Empty description="Không có OT chờ duyệt" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className={styles.list}>
            {data.map((item) => (
              <article key={item.id} className={styles.item}>
                <div className={styles.itemBody}>
                  <div className={styles.itemTitle}>
                    <strong>{item.requestedBy.name || item.assignee.name}</strong>
                    <span className={styles.hours}>+{item.estimatedHours}h OT</span>
                  </div>
                  <p className={styles.project}>
                    {item.project.name} · {dayjs(item.otDate).format('DD/MM/YYYY')} ·{' '}
                    {item.startTime}–{item.endTime}
                  </p>
                  <p className={styles.reason}>{item.reason}</p>
                </div>
                <div className={styles.actions}>
                  <Button
                    type="primary"
                    className={styles.approve}
                    loading={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(item.id)}
                  >
                    Duyệt
                  </Button>
                  <Button
                    danger
                    onClick={() => {
                      setRejectId(item.id);
                      setRejectReason('');
                    }}
                  >
                    Từ chối
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardWrapper>

      <Modal
        title="Từ chối OT"
        open={Boolean(rejectId)}
        onCancel={() => setRejectId(null)}
        onOk={handleReject}
        okText="Từ chối"
        okButtonProps={{ danger: true, disabled: !rejectReason.trim() }}
        confirmLoading={rejectMutation.isPending}
        destroyOnHidden
      >
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>
    </>
  );
}
