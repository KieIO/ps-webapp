import { Alert, Button, Descriptions, Drawer, Form, Input, Modal, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DATE_FORMAT, DATETIME_SHORT_FORMAT, buildMyTaskDetailPath } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { AssignOtTaskModal } from '../AssignOtTaskModal/AssignOtTaskModal';
import { OvertimeStatusBadge } from '../OvertimeStatusBadge/OvertimeStatusBadge';
import {
  useApproveOvertime,
  useOvertimeDetail,
  useRejectOvertime,
  useReviewOtResult,
} from '../../hooks/useOvertime';
import styles from './OvertimeDetailDrawer.module.scss';

interface OvertimeDetailDrawerProps {
  overtimeId: string | null;
  open: boolean;
  onClose: () => void;
}

export function OvertimeDetailDrawer({ overtimeId, open, onClose }: OvertimeDetailDrawerProps) {
  const { can } = usePermission();
  const canRequest = can('REQUEST_OT');
  const canApprove = can('APPROVE_OT');

  const { data: record, isLoading, isError, refetch } = useOvertimeDetail(overtimeId, open);
  const approveMutation = useApproveOvertime();
  const rejectMutation = useRejectOvertime();
  const reviewMutation = useReviewOtResult();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rejectForm] = Form.useForm<{ reason: string }>();
  const [reviewForm] = Form.useForm<{ note: string }>();

  const handleClose = () => {
    setRejectOpen(false);
    setAssignOpen(false);
    setReviewOpen(false);
    onClose();
  };

  const status = record?.status;

  return (
    <>
      <Drawer
        title="Chi tiết OT Request"
        open={open}
        onClose={handleClose}
        width={520}
        destroyOnHidden
      >
        {isLoading ? (
          <div className={styles.loading}>
            <Spin />
          </div>
        ) : isError || !record ? (
          <Alert
            type="error"
            showIcon
            message="Không tải được chi tiết OT"
            action={
              <Button size="small" onClick={() => void refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : (
          <div className={styles.body}>
            <div className={styles.statusRow}>
              <OvertimeStatusBadge status={record.status} />
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Dự án">
                {record.project.name || record.project.code}
              </Descriptions.Item>
              <Descriptions.Item label="Người OT">
                {record.assignee.name || record.assignee.code}
              </Descriptions.Item>
              <Descriptions.Item label="Người yêu cầu">
                {record.requestedBy.name || record.requestedBy.code}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày OT">
                {dayjs(record.otDate).format(DATE_FORMAT)}
              </Descriptions.Item>
              <Descriptions.Item label="Khung giờ">
                {record.startTime} – {record.endTime}
              </Descriptions.Item>
              <Descriptions.Item label="Ước tính">{record.estimatedHours}h</Descriptions.Item>
              <Descriptions.Item label="Thực tế">
                {record.actualHours != null ? `${record.actualHours}h` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do">{record.reason || '—'}</Descriptions.Item>
              {record.task?.id || record.taskName ? (
                <Descriptions.Item label="Task OT">
                  {record.task?.id ? (
                    <Link to={buildMyTaskDetailPath(record.task.id)}>
                      {record.task.name || record.taskName || 'Xem task'}
                    </Link>
                  ) : (
                    record.taskName
                  )}
                </Descriptions.Item>
              ) : null}
              {record.staffNote ? (
                <Descriptions.Item label="Ghi chú staff">{record.staffNote}</Descriptions.Item>
              ) : null}
              {record.rejectReason ? (
                <Descriptions.Item label="Lý do từ chối">{record.rejectReason}</Descriptions.Item>
              ) : null}
              {record.approvedBy ? (
                <Descriptions.Item label="Người duyệt">
                  {record.approvedBy.name}
                  {record.approvedAt
                    ? ` · ${dayjs(record.approvedAt).format(DATETIME_SHORT_FORMAT)}`
                    : ''}
                </Descriptions.Item>
              ) : null}
              {record.resultReviewNote ? (
                <Descriptions.Item label="Review note">{record.resultReviewNote}</Descriptions.Item>
              ) : null}
            </Descriptions>

            <Space className={styles.actions} wrap>
              {canApprove && status === 'pending' ? (
                <>
                  <Button
                    type="primary"
                    className={styles.approve}
                    loading={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(record.id)}
                  >
                    Duyệt
                  </Button>
                  <Button danger onClick={() => setRejectOpen(true)}>
                    Từ chối
                  </Button>
                </>
              ) : null}

              {canRequest && status === 'approved' ? (
                <Button type="primary" onClick={() => setAssignOpen(true)}>
                  Gán task OT
                </Button>
              ) : null}

              {canRequest && status === 'awaiting_review' ? (
                <Button type="primary" onClick={() => setReviewOpen(true)}>
                  Review kết quả
                </Button>
              ) : null}
            </Space>
          </div>
        )}
      </Drawer>

      <Modal
        title="Từ chối OT"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={() => rejectForm.submit()}
        okText="Từ chối"
        okButtonProps={{ danger: true }}
        confirmLoading={rejectMutation.isPending}
        destroyOnHidden
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={(values) => {
            if (!record) return;
            rejectMutation.mutate(
              { id: record.id, payload: { reason: values.reason.trim() } },
              { onSuccess: () => setRejectOpen(false) },
            );
          }}
        >
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Nhập lý do từ chối' }]}
          >
            <Input.TextArea rows={3} placeholder="Lý do..." />
          </Form.Item>
        </Form>
      </Modal>

      {record ? (
        <AssignOtTaskModal
          open={assignOpen}
          overtime={record}
          onClose={() => setAssignOpen(false)}
          onAssigned={() => void refetch()}
        />
      ) : null}

      <Modal
        title="Review kết quả OT"
        open={reviewOpen}
        onCancel={() => setReviewOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú review (tuỳ chọn)" />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              loading={reviewMutation.isPending}
              onClick={() => {
                if (!record) return;
                const note = (reviewForm.getFieldValue('note') as string | undefined)?.trim() ?? '';
                reviewMutation.mutate(
                  { id: record.id, payload: { approve: true, note } },
                  { onSuccess: () => setReviewOpen(false) },
                );
              }}
            >
              Duyệt kết quả
            </Button>
            <Button
              danger
              loading={reviewMutation.isPending}
              onClick={() => {
                if (!record) return;
                const note = (reviewForm.getFieldValue('note') as string | undefined)?.trim() ?? '';
                if (!note) {
                  reviewForm.setFields([{ name: 'note', errors: ['Nhập lý do từ chối kết quả'] }]);
                  return;
                }
                reviewMutation.mutate(
                  { id: record.id, payload: { approve: false, note } },
                  { onSuccess: () => setReviewOpen(false) },
                );
              }}
            >
              Từ chối kết quả
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
}
