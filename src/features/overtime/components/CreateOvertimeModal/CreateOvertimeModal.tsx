import { DatePicker, Form, Input, InputNumber, Modal, Select, TimePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { ROLES } from '@/config/permissions';
import { useProjectList } from '@/features/projects/hooks/useProjectList';
import { useUserList } from '@/features/users/hooks/useUserList';
import { useCreateOvertime } from '../../hooks/useOvertime';
import type { CreateOvertimeRequest } from '../../schemas/overtime.schema';
import styles from './CreateOvertimeModal.module.scss';

interface CreateOvertimeFormValues {
  projectId: string;
  assigneeId: string;
  otDate: Dayjs;
  timeRange: [Dayjs, Dayjs];
  estimatedHours: number;
  reason: string;
}

interface CreateOvertimeModalProps {
  open: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

const range = (start: number, end: number): number[] => {
  const result: number[] = [];
  for (let i = start; i < end; i += 1) result.push(i);
  return result;
};

/** When OT date is today, block hours/minutes before the current clock time. */
const disabledTimeFromNow = (otDate: Dayjs | undefined) => {
  if (!otDate?.isSame(dayjs(), 'day')) {
    return () => ({});
  }

  return () => {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();
    return {
      disabledHours: () => range(0, hour),
      disabledMinutes: (selectedHour: number) => {
        if (selectedHour > hour) return [];
        if (selectedHour < hour) return range(0, 60);
        return range(0, minute);
      },
    };
  };
};

/** Exact window length in hours, 2 decimals — never round up past the window. */
const hoursFromTimeRange = (timeRange: [Dayjs, Dayjs] | null | undefined): number | undefined => {
  if (!timeRange?.[0] || !timeRange?.[1]) return undefined;
  const minutes = timeRange[1].diff(timeRange[0], 'minute');
  if (minutes <= 0) return undefined;
  // Floor to 2 decimals so 15m → 0.25 (not 0.3 from 1-decimal round-up).
  return Math.floor((minutes / 60) * 100) / 100;
};

export function CreateOvertimeModal({ open, onClose, defaultProjectId }: CreateOvertimeModalProps) {
  const [form] = Form.useForm<CreateOvertimeFormValues>();
  const { mutate, isPending } = useCreateOvertime();
  const { data: projectList } = useProjectList({});
  const otDate = Form.useWatch('otDate', form);
  // OT assignee = Staff only (employee), not Head/CH/Admin.
  const { data: staffList } = useUserList(
    { role: ROLES.EMPLOYEE, status: 'active' },
    { enabled: open },
  );
  const staffOptions = useMemo(
    () =>
      (staffList?.items ?? []).map((user) => ({
        value: user.id,
        label: user.name,
      })),
    [staffList?.items],
  );

  const timeDisabled = useMemo(() => disabledTimeFromNow(otDate), [otDate]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        projectId: defaultProjectId,
        otDate: dayjs(),
      });
    } else {
      form.resetFields();
    }
  }, [open, defaultProjectId, form]);

  const syncEstimatedHours = (timeRange: [Dayjs, Dayjs] | null) => {
    form.setFieldValue('estimatedHours', hoursFromTimeRange(timeRange));
  };

  const handleOtDateChange = (value: Dayjs | null) => {
    if (!value?.isSame(dayjs(), 'day')) return;
    const timeRange = form.getFieldValue('timeRange') as [Dayjs, Dayjs] | undefined;
    if (!timeRange?.[0]) return;
    const now = dayjs();
    const startToday = value.hour(timeRange[0].hour()).minute(timeRange[0].minute()).second(0);
    if (startToday.isBefore(now, 'minute')) {
      form.setFieldsValue({ timeRange: undefined, estimatedHours: undefined });
    }
  };

  const handleFinish = (values: CreateOvertimeFormValues) => {
    const estimatedHours = hoursFromTimeRange(values.timeRange);
    if (estimatedHours == null || estimatedHours <= 0) return;

    const payload: CreateOvertimeRequest = {
      projectId: values.projectId,
      assigneeId: values.assigneeId,
      otDate: values.otDate.format('YYYY-MM-DD'),
      startTime: values.timeRange[0].format('HH:mm'),
      endTime: values.timeRange[1].format('HH:mm'),
      estimatedHours,
      reason: values.reason.trim(),
    };

    mutate(payload, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Tạo OT Request"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Tạo request"
      confirmLoading={isPending}
      destroyOnHidden
      width={560}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="projectId"
          label="Dự án"
          rules={[{ required: true, message: 'Chọn dự án' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Chọn dự án"
            disabled={Boolean(defaultProjectId)}
            options={(projectList?.items ?? []).map((project) => ({
              value: project.id,
              label: project.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="assigneeId"
          label="Người làm OT"
          rules={[{ required: true, message: 'Chọn nhân sự' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Chọn staff"
            options={staffOptions}
          />
        </Form.Item>

        <div className={styles.row}>
          <Form.Item
            name="otDate"
            label="Ngày OT"
            rules={[{ required: true, message: 'Chọn ngày' }]}
            className={styles.half}
          >
            <DatePicker
              format={DATE_FORMAT}
              className={styles.fullWidth}
              disabledDate={(current) => current.isBefore(dayjs(), 'day')}
              onChange={handleOtDateChange}
            />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Khung giờ"
            rules={[
              { required: true, message: 'Chọn khung giờ' },
              {
                validator: async (_, value: [Dayjs, Dayjs] | undefined) => {
                  if (!value?.[0] || !otDate?.isSame(dayjs(), 'day')) return;
                  const start = otDate.hour(value[0].hour()).minute(value[0].minute()).second(0);
                  if (start.isBefore(dayjs(), 'minute')) {
                    throw new Error('Khung giờ phải từ thời điểm hiện tại trở đi');
                  }
                },
              },
            ]}
            className={styles.half}
          >
            <TimePicker.RangePicker
              format="HH:mm"
              className={styles.fullWidth}
              disabledTime={timeDisabled}
              hideDisabledOptions
              onChange={(value) => syncEstimatedHours(value as [Dayjs, Dayjs] | null)}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="estimatedHours"
          label="Số giờ ước tính"
          extra="Tự tính từ khung giờ đã chọn"
          rules={[{ required: true, message: 'Chọn khung giờ để tính số giờ' }]}
        >
          <InputNumber className={styles.fullWidth} addonAfter="giờ" disabled readOnly />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Lý do"
          rules={[{ required: true, message: 'Nhập lý do OT' }]}
        >
          <Input.TextArea rows={3} placeholder="Lý do cần OT..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
