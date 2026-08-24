import { Alert, Button, Drawer, Form, Input, InputNumber, Modal, Segmented, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { useAssignCreativeManager } from '../../hooks/useAssignCreativeManager';
import { useAssignPickerCapacity } from '../../hooks/useAssignPickerCapacity';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import type { CreativeAssignMode, MyTask } from '../../schemas/task.schema';
import {
  canSelectAssignee,
  displayCapacityPercent,
  filterCreativeStaff,
  getAssigneeWorkload,
  isAwaitingCm,
  resolveAssigneeAvailability,
} from '../../utils/creativePipeline';
import { ASSIGN_OVERLOAD_CAPACITY_PERCENT } from '../../utils/staffAvailability';
import { AssigneeOptionLabel } from './AssigneeOptionLabel';
import styles from './creativePipeline.module.scss';

interface CreativeManagerAssignDrawerProps {
  open: boolean;
  task: MyTask | null;
  readOnly?: boolean;
  onClose: () => void;
}

type SubtaskForm = {
  name?: string;
  staffUserId?: string;
  quantity?: number;
};

type ManagerFormValues = {
  staffUserId?: string;
  subtasks?: SubtaskForm[];
};

const emptySubtask = (): SubtaskForm => ({ name: '', staffUserId: undefined, quantity: 1 });

export function CreativeManagerAssignDrawer({
  open,
  task,
  readOnly = false,
  onClose,
}: CreativeManagerAssignDrawerProps) {
  const [form] = Form.useForm<ManagerFormValues>();
  const [mode, setMode] = useState<CreativeAssignMode>('whole');
  const { mutate, isPending } = useAssignCreativeManager();
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { data: taskList } = useMyTaskList({ taskCategory: 'project' }, { enabled: open });
  const allTasks = useMemo(() => taskList?.items ?? [], [taskList?.items]);
  const {
    capacityByUserId,
    periodNote,
    isLoading: capacityLoading,
    isError: capacityError,
  } = useAssignPickerCapacity(task, open);
  const canSubmit = Boolean(task && !readOnly && isAwaitingCm(task));

  const staffSelectOptions = useMemo(
    () =>
      filterCreativeStaff(staffOptions).map((staff) => {
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
    setMode('whole');
    form.setFieldsValue({
      staffUserId: undefined,
      subtasks: [emptySubtask(), emptySubtask()],
    });
  }, [open, task, form]);

  const resetAndClose = () => {
    form.resetFields();
    setMode('whole');
    onClose();
  };

  const handleCloseRequest = () => {
    if (isPending) return;
    if (!readOnly && form.isFieldsTouched()) {
      Modal.confirm({
        title: 'Hủy giao task?',
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
    const values = await form.validateFields(mode === 'whole' ? ['staffUserId'] : ['subtasks']);
    mutate(
      {
        id: task.id,
        payload:
          mode === 'whole'
            ? { mode, staffUserId: values.staffUserId }
            : {
                mode,
                subtasks: (values.subtasks ?? []).map((subtask) => ({
                  name: (subtask.name ?? '').trim(),
                  staffUserId: subtask.staffUserId ?? '',
                  quantity: subtask.quantity ?? 1,
                })),
              },
      },
      { onSuccess: resetAndClose },
    );
  };

  const renderStaffSelect = (disabled: boolean) => (
    <Select
      showSearch
      optionFilterProp="label"
      disabled={disabled}
      placeholder="Chọn Staff"
      options={staffSelectOptions}
      optionRender={(option) => {
        const data = option.data as {
          staff: (typeof staffSelectOptions)[number]['staff'];
          activeCount: number;
          capacityPercent: number;
          availability: (typeof staffSelectOptions)[number]['availability'];
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
  );

  return (
    <Drawer
      title="Giao task cho Staff"
      open={open}
      onClose={handleCloseRequest}
      width={520}
      destroyOnHidden
      maskClosable={!isPending}
      footer={
        <div className={styles.footer}>
          <Button onClick={handleCloseRequest} disabled={isPending}>
            {canSubmit ? 'Hủy' : 'Đóng'}
          </Button>
          {canSubmit ? (
            <Button type="primary" loading={isPending} onClick={() => void handleSubmit()}>
              {mode === 'split' ? 'Giao tất cả task nhỏ' : 'Giao nguyên task'}
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
              {task.projectName} · Level {task.level} · {dayjs(task.date).format(DATE_FORMAT)}
              {task.creativeManager?.name ? ` · Từ CH / CM: ${task.creativeManager.name}` : ''}
            </p>
            <div className={styles.briefBlock}>{task.description || '—'}</div>
          </div>

          <div className={styles.levelBox}>
            Level task: {task.level} — đã khóa, Creative Manager không phân loại lại.
          </div>

          {task.cmNote ? (
            <Alert type="info" showIcon message={`Ghi chú từ CH: ${task.cmNote}`} />
          ) : null}

          {canSubmit ? (
            <>
              <Segmented
                className={styles.modeToggle}
                block
                value={mode}
                onChange={(value) => setMode(value as CreativeAssignMode)}
                options={[
                  { label: 'Giao nguyên task', value: 'whole' },
                  { label: 'Chia thành task nhỏ', value: 'split' },
                ]}
              />

              <Form form={form} layout="vertical">
                {mode === 'whole' ? (
                  <Form.Item
                    name="staffUserId"
                    label="Giao cho"
                    rules={[{ required: true, message: 'Chọn Staff nhận task' }]}
                  >
                    {renderStaffSelect(false)}
                  </Form.Item>
                ) : (
                  <>
                    <div className={`${styles.banner} ${styles.bannerProject}`}>
                      Có thể chia 1 task lớn thành nhiều task nhỏ để giao cho nhiều Staff cùng lúc.
                    </div>
                    <Form.List name="subtasks">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <div className={styles.subtaskCard} key={field.key}>
                              <div className={styles.subtaskHeader}>
                                <span>Task nhỏ {index + 1}</span>
                                {fields.length > 2 ? (
                                  <Button type="link" danger onClick={() => remove(field.name)}>
                                    Xóa
                                  </Button>
                                ) : null}
                              </div>
                              <Form.Item
                                name={[field.name, 'name']}
                                label="Tên task nhỏ"
                                rules={[{ required: true, message: 'Nhập tên task nhỏ' }]}
                              >
                                <Input placeholder={`${task.taskName} — phần ${index + 1}`} />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'staffUserId']}
                                label="Giao cho"
                                rules={[{ required: true, message: 'Chọn Staff' }]}
                              >
                                {renderStaffSelect(false)}
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'quantity']}
                                label="Số lượng"
                                rules={[{ required: true, message: 'Required' }]}
                              >
                                <InputNumber min={0} style={{ width: '100%' }} />
                              </Form.Item>
                            </div>
                          ))}
                          <Button className={styles.addSubtask} onClick={() => add(emptySubtask())}>
                            + Thêm task nhỏ
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </>
                )}
              </Form>
            </>
          ) : (
            <Alert
              type="success"
              showIcon
              message={
                task.pipelineStage === 'split'
                  ? 'Task đã được chia nhỏ và giao cho Staff.'
                  : `Đã giao cho ${task.staff[0]?.name ?? 'Staff'}.`
              }
            />
          )}

          <div className={styles.workload}>
            <p className={styles.workloadTitle}>Workload team</p>
            <p className={styles.note}>{periodNote}</p>
            {staffSelectOptions.map((option) => (
              <div
                key={option.value}
                className={`${styles.workloadRow} ${option.disabled ? styles.workloadMuted : ''}`}
              >
                <span>{option.staff.name}</span>
                <span>{option.activeCount} tasks</span>
                <span>{option.capacityPercent}%</span>
              </div>
            ))}
            <p className={styles.note}>
              Tham khảo khi chia task. Không giao khi capacity ≥ {ASSIGN_OVERLOAD_CAPACITY_PERCENT}%
              (Overloaded).
              {capacityLoading ? ' Đang tải capacity…' : null}
              {capacityError ? ' Không tải được capacity — dùng ước lượng tạm.' : null}
            </p>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
