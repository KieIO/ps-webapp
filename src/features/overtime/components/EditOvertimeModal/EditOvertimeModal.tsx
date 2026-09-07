import { DatePicker, Form, Input, InputNumber, Modal, Select, TimePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { ROLES } from '@/config/permissions';
import { useProjectList } from '@/features/projects/hooks/useProjectList';
import { useUserList } from '@/features/users/hooks/useUserList';
import { OT_REASON_CATEGORY_OPTIONS } from '../../constants';
import { useUpdateOvertime } from '../../hooks/useOvertime';
import type { OvertimeRecord } from '../../schemas/overtime.schema';
import {
  buildOvertimeWriteFields,
  disabledTimeFromNow,
  hoursFromTimeRange,
  otTimeRangePastRule,
  parseOtHHMM,
  shouldClearPastTimeRange,
} from '../../utils/otForm';
import styles from '../CreateOvertimeModal/CreateOvertimeModal.module.scss';

interface EditOvertimeFormValues {
  projectId: string;
  assigneeId: string;
  otDate: Dayjs;
  timeRange: [Dayjs, Dayjs];
  estimatedHours: number;
  reasonCategories: string[];
  reason: string;
}

interface EditOvertimeModalProps {
  open: boolean;
  record: OvertimeRecord | null;
  onClose: () => void;
}

export function EditOvertimeModal({ open, record, onClose }: EditOvertimeModalProps) {
  const [form] = Form.useForm<EditOvertimeFormValues>();
  const { mutate, isPending } = useUpdateOvertime();
  const { data: projectList } = useProjectList({});
  const otDate = Form.useWatch('otDate', form);
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
  const originalOtDate = record?.otDate;

  useEffect(() => {
    if (!open || !record) {
      form.resetFields();
      return;
    }

    const date = dayjs(record.otDate);
    const timeRange: [Dayjs, Dayjs] = [
      parseOtHHMM(record.startTime, date),
      parseOtHHMM(record.endTime, date),
    ];
    form.setFieldsValue({
      projectId: record.project.id,
      assigneeId: record.assignee.userId,
      otDate: date,
      timeRange,
      estimatedHours: hoursFromTimeRange(timeRange) ?? record.estimatedHours,
      reasonCategories: record.reasonCategories ?? [],
      reason: record.reason,
    });
  }, [open, record, form]);

  const syncEstimatedHours = (timeRange: [Dayjs, Dayjs] | null) => {
    form.setFieldValue('estimatedHours', hoursFromTimeRange(timeRange));
  };

  const handleOtDateChange = (value: Dayjs | null) => {
    const timeRange = form.getFieldValue('timeRange') as [Dayjs, Dayjs] | undefined;
    if (shouldClearPastTimeRange(value, timeRange)) {
      form.setFieldsValue({ timeRange: undefined, estimatedHours: undefined });
    }
  };

  const handleFinish = (values: EditOvertimeFormValues) => {
    if (!record) return;
    const payload = buildOvertimeWriteFields(values);
    if (!payload) return;

    mutate(
      { id: record.id, payload },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      title="Chỉnh sửa OT Request"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Lưu thay đổi"
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
              disabledDate={(current) => {
                if (originalOtDate && current.isSame(dayjs(originalOtDate), 'day')) return false;
                return current.isBefore(dayjs(), 'day');
              }}
              onChange={handleOtDateChange}
            />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Khung giờ"
            rules={[{ required: true, message: 'Chọn khung giờ' }, otTimeRangePastRule(otDate)]}
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
          name="reasonCategories"
          label="Lý do OT"
          rules={[{ required: true, type: 'array', min: 1, message: 'Chọn ít nhất một lý do' }]}
        >
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Chọn lý do (có thể chọn nhiều)"
            options={[...OT_REASON_CATEGORY_OPTIONS]}
            maxTagCount="responsive"
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Mô tả chi tiết"
          rules={[{ required: true, message: 'Nhập mô tả chi tiết lý do OT' }]}
        >
          <Input.TextArea rows={3} placeholder="Mô tả chi tiết lý do cần OT..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
