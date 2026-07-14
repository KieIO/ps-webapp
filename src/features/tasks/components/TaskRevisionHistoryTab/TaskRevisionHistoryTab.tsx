import { Alert, Button, Form, Input, InputNumber, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { usePermission } from '@/shared/hooks/usePermission';
import { useCreateTaskQualityReview } from '../../hooks/useCreateTaskQualityReview';
import { useTaskQualityReviews } from '../../hooks/useTaskQualityReviews';
import type { CreateQualityReviewRequest } from '../../schemas/task.schema';
import styles from './TaskRevisionHistoryTab.module.scss';

interface TaskRevisionHistoryTabProps {
  taskId: string;
}

const formatRevisionCount = (count: number): string =>
  count === 0 ? '0 lần sửa' : `${count} lần sửa`;

export function TaskRevisionHistoryTab({ taskId }: TaskRevisionHistoryTabProps) {
  const { can } = usePermission();
  const canUpdate = can('EVALUATE_TASK');
  const [form] = Form.useForm<CreateQualityReviewRequest>();
  const { data, isLoading, isError } = useTaskQualityReviews(taskId);
  const { mutate, isPending } = useCreateTaskQualityReview();
  const items = data?.items ?? [];

  const handleFinish = (values: CreateQualityReviewRequest) => {
    mutate(
      {
        id: taskId,
        payload: {
          revisionCount: values.revisionCount,
          comment: values.comment ?? '',
        },
      },
      {
        onSuccess: () => {
          form.resetFields();
          form.setFieldsValue({ revisionCount: 0, comment: '' });
        },
      },
    );
  };

  return (
    <div className={styles.root}>
      {canUpdate ? (
        <div className={styles.formBlock}>
          <p className={styles.sectionTitle}>Ghi nhận revision</p>
          <p className={styles.hint}>Chỉ lần ghi mới nhất được tính — không cộng dồn lịch sử.</p>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{ revisionCount: 0, comment: '' }}
            onFinish={handleFinish}
            className={styles.form}
          >
            <Form.Item
              name="revisionCount"
              label="Số lần sửa"
              rules={[{ required: true, message: 'Nhập số lần sửa' }]}
            >
              <InputNumber min={0} precision={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="comment" label="Ghi chú">
              <Input.TextArea rows={2} placeholder="Optional note" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Ghi nhận revision
            </Button>
          </Form>
        </div>
      ) : null}

      <div className={styles.listBlock}>
        <p className={styles.sectionTitle}>Lịch sử</p>
        {isLoading ? (
          <div className={styles.loading}>
            <Spin size="small" />
          </div>
        ) : isError ? (
          <Alert type="error" showIcon message="Unable to load revision history." />
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            {canUpdate
              ? 'Chưa có revision nào — ghi nhận lần đầu ở phía trên.'
              : 'No revision history for this task yet.'}
          </div>
        ) : (
          <ul className={styles.list}>
            {items.map((item, index) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.count}>{formatRevisionCount(item.revisionCount)}</span>
                  {index === 0 ? (
                    <Tag className={styles.latestTag} color="blue">
                      Mới nhất
                    </Tag>
                  ) : null}
                  <span className={styles.meta}>
                    {item.reviewerName || '—'} · {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {item.comment ? <p className={styles.comment}>{item.comment}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
