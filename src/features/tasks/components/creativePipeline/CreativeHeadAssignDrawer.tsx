import { Alert, Button, Drawer, Form, Input, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { MY_TASK_COLUMN_HEADERS } from '../../constants';
import { useAssignCreativeHead } from '../../hooks/useAssignCreativeHead';
import { useAssignPickerCapacity } from '../../hooks/useAssignPickerCapacity';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import type { MyTask } from '../../schemas/task.schema';
import { computeTaskLevel } from '../../utils/taskLevel';
import {
  canSelectAssignee,
  displayCapacityPercent,
  filterCreativeManagers,
  getAssigneeWorkload,
  isAwaitingCh,
  needsChBrief,
  resolveAssigneeAvailability,
} from '../../utils/creativePipeline';
import { ASSIGN_OVERLOAD_CAPACITY_PERCENT } from '../../utils/staffAvailability';
import { ClassificationScale } from '../CreateTaskDrawer/ClassificationScale';
import { AssigneeOptionLabel } from './AssigneeOptionLabel';
import styles from './creativePipeline.module.scss';

interface CreativeHeadAssignDrawerProps {
  open: boolean;
  task: MyTask | null;
  readOnly?: boolean;
  onClose: () => void;
}

type HeadFormValues = {
  description?: string;
  designThinking?: number;
  technical?: number;
  contentProcessing?: number;
  cmUserId?: string;
  cmNote?: string;
};

export function CreativeHeadAssignDrawer({
  open,
  task,
  readOnly = false,
  onClose,
}: CreativeHeadAssignDrawerProps) {
  const [form] = Form.useForm<HeadFormValues>();
  const { mutate, isPending } = useAssignCreativeHead();
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { data: taskList } = useMyTaskList({ taskCategory: 'project' }, { enabled: open });
  const allTasks = useMemo(() => taskList?.items ?? [], [taskList?.items]);
  const {
    capacityByUserId,
    periodNote,
    isLoading: capacityLoading,
    isError: capacityError,
  } = useAssignPickerCapacity(task, open);

  const fillBrief = Boolean(task && needsChBrief(task));
  const lockedBrief = Boolean(task && !needsChBrief(task));
  const canSubmit = Boolean(task && !readOnly && isAwaitingCh(task));

  const designThinking = Form.useWatch('designThinking', form);
  const technical = Form.useWatch('technical', form);
  const contentProcessing = Form.useWatch('contentProcessing', form);
  const computedLevel =
    designThinking != null && technical != null && contentProcessing != null
      ? computeTaskLevel(designThinking, technical, contentProcessing)
      : task?.level;

  const cmOptions = useMemo(
    () =>
      filterCreativeManagers(staffOptions).map((staff) => {
        const workload = getAssigneeWorkload(allTasks, staff.userId ?? undefined);
        return {
          value: staff.userId ?? staff.code,
          label: staff.name,
          disabled: !canSelectAssignee(staff, allTasks, capacityByUserId),
          staff,
          activeCount: workload.activeCount,
          capacityPercent: displayCapacityPercent(staff, allTasks, capacityByUserId),
          availability: resolveAssigneeAvailability(staff, capacityByUserId),
        };
      }),
    [staffOptions, allTasks, capacityByUserId],
  );

  useEffect(() => {
    if (!open || !task) return;
    form.setFieldsValue({
      description: task.description,
      designThinking: fillBrief ? undefined : task.designThinking,
      technical: fillBrief ? undefined : task.technical,
      contentProcessing: fillBrief ? undefined : task.contentProcessing,
      cmUserId: task.creativeManager?.userId ?? task.staff[0]?.userId ?? undefined,
      cmNote: task.cmNote ?? '',
    });
  }, [open, task, fillBrief, form]);

  const resetAndClose = () => {
    form.resetFields();
    onClose();
  };

  const handleCloseRequest = () => {
    if (isPending) return;
    if (!readOnly && form.isFieldsTouched()) {
      Modal.confirm({
        title: 'Hủy xử lý task?',
        content: 'Thông tin đã nhập sẽ không được lưu.',
        okText: 'Hủy',
        cancelText: 'Tiếp tục',
        okButtonProps: { danger: true },
        onOk: resetAndClose,
      });
      return;
    }
    resetAndClose();
  };

  const handleSubmit = async () => {
    if (!task) return;
    const values = await form.validateFields();
    if (!values.cmUserId) return;
    mutate(
      {
        id: task.id,
        payload: {
          cmUserId: values.cmUserId,
          description: values.description,
          designThinking: values.designThinking,
          technical: values.technical,
          contentProcessing: values.contentProcessing,
          cmNote: values.cmNote,
        },
      },
      { onSuccess: resetAndClose },
    );
  };

  return (
    <Drawer
      title={fillBrief ? 'Fill brief & assign CM' : 'Assign cho Creative Manager'}
      open={open}
      onClose={handleCloseRequest}
      width={480}
      destroyOnHidden
      maskClosable={!isPending}
      footer={
        <div className={styles.footer}>
          <Button onClick={handleCloseRequest} disabled={isPending}>
            {canSubmit ? 'Hủy' : 'Đóng'}
          </Button>
          {canSubmit ? (
            <Button type="primary" loading={isPending} onClick={() => void handleSubmit()}>
              {fillBrief ? 'Fill brief & Assign cho CM' : 'Assign cho CM'}
            </Button>
          ) : null}
        </div>
      }
    >
      {task ? (
        <div className={styles.root}>
          <div className={styles.contextCard}>
            <p className={styles.contextTitle}>
              {task.taskCode} — {task.taskName}
            </p>
            <p className={styles.contextMeta}>
              {task.projectName} · {task.projectManager.name} ·{' '}
              {dayjs(task.date).format(DATE_FORMAT)}
            </p>
          </div>

          {lockedBrief ? (
            <div className={`${styles.banner} ${styles.bannerProject}`}>
              Project Task — Brief có sẵn từ PM. Creative Head chỉ assign cho CM, không sửa brief
              hay Level.
            </div>
          ) : (
            <div className={`${styles.banner} ${styles.bannerCreative}`}>
              Creative Task — Chưa có brief. Fill mô tả, phân loại Level, rồi chọn CM.
            </div>
          )}

          <Form form={form} layout="vertical" requiredMark={fillBrief}>
            {lockedBrief ? (
              <>
                <p className={styles.sectionLabel}>Brief từ PM</p>
                <div className={styles.contextCard}>
                  <div className={styles.briefBlock}>{task.description || '—'}</div>
                </div>
                <p className={styles.sectionLabel}>Phân loại độ khó</p>
                <div className={styles.lockedScale}>
                  <Form.Item label={MY_TASK_COLUMN_HEADERS.designThinking} name="designThinking">
                    <ClassificationScale disabled />
                  </Form.Item>
                  <Form.Item label={MY_TASK_COLUMN_HEADERS.technical} name="technical">
                    <ClassificationScale disabled />
                  </Form.Item>
                  <Form.Item
                    label={MY_TASK_COLUMN_HEADERS.contentProcessing}
                    name="contentProcessing"
                  >
                    <ClassificationScale disabled />
                  </Form.Item>
                </div>
                <div className={styles.levelBox}>Level task: {task.level}</div>
              </>
            ) : (
              <>
                <Form.Item
                  name="description"
                  label="Mô tả & yêu cầu chi tiết"
                  rules={[{ required: true, message: 'Brief is required' }]}
                >
                  <Input.TextArea
                    rows={3}
                    disabled={readOnly}
                    placeholder="CH fill brief sau khi nhận task từ PM..."
                  />
                </Form.Item>
                <p className={styles.sectionLabel}>Phân loại Task Level</p>
                <Form.Item
                  name="designThinking"
                  label={MY_TASK_COLUMN_HEADERS.designThinking}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <ClassificationScale disabled={readOnly} />
                </Form.Item>
                <Form.Item
                  name="technical"
                  label={MY_TASK_COLUMN_HEADERS.technical}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <ClassificationScale disabled={readOnly} />
                </Form.Item>
                <Form.Item
                  name="contentProcessing"
                  label={MY_TASK_COLUMN_HEADERS.contentProcessing}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <ClassificationScale disabled={readOnly} />
                </Form.Item>
                <div className={styles.levelBox}>Level task: {computedLevel ?? '—'}</div>
              </>
            )}

            <Form.Item name="cmNote" label="Ghi chú cho CM">
              <Input.TextArea rows={2} disabled={readOnly} placeholder="Tùy chọn" />
            </Form.Item>

            <Form.Item
              name="cmUserId"
              label="Chọn Creative Manager"
              rules={[{ required: canSubmit, message: 'Chọn Creative Manager' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                disabled={readOnly}
                placeholder="Chọn CM theo workload"
                options={cmOptions}
                optionRender={(option) => {
                  const data = option.data as {
                    staff: (typeof cmOptions)[number]['staff'];
                    activeCount: number;
                    capacityPercent: number;
                    availability: (typeof cmOptions)[number]['availability'];
                  };
                  return (
                    <AssigneeOptionLabel
                      staff={data.staff}
                      activeCount={data.activeCount}
                      capacityPercent={data.capacityPercent}
                      availability={data.availability}
                    />
                  );
                }}
              />
            </Form.Item>
            <p className={styles.note}>
              {periodNote}. Không giao khi capacity ≥ {ASSIGN_OVERLOAD_CAPACITY_PERCENT}%
              (Overloaded) hoặc nghỉ phép.
              {capacityLoading ? ' Đang tải capacity…' : null}
              {capacityError ? ' Không tải được capacity — dùng ước lượng tạm.' : null}
            </p>
            {cmOptions.length === 0 ? (
              <Alert
                type="warning"
                showIcon
                message="Không có Creative Manager khả dụng. Kiểm tra danh sách user role CM."
              />
            ) : null}
            <Alert
              type="info"
              showIcon
              message="Ai trong số Creative Head cũng thấy task này. Người assign trước sẽ khóa task cho CM."
            />
          </Form>
        </div>
      ) : null}
    </Drawer>
  );
}
