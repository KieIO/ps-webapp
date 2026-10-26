import { Checkbox, DatePicker, Form, Input, InputNumber, Modal, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import {
  MILESTONE_UNIT_LABELS,
  MILESTONE_UNITS,
  isSlidesOrDaUnit,
  type ProjectMilestone,
  type ProjectMilestoneInput,
  type MilestoneUnit,
} from '@/features/projects/schemas/milestone.schema';
import { milestoneFieldLabel } from '@/features/projects/utils/milestoneFieldLabel';
import { useReplaceProjectMilestones } from '@/features/projects/hooks/useReplaceProjectMilestones';
import {
  toMilestoneDateKey,
  toReplaceMilestonePayload,
  validateMilestones,
} from '@/features/projects/utils/milestoneValidation';

export type MilestoneQuickMode = 'create' | 'edit';

export type MilestoneQuickTarget = {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  milestones: ProjectMilestone[];
  mode: MilestoneQuickMode;
  /** Prefill / edit deadline (YYYY-MM-DD). */
  deadlineDate: string;
  /** Required when mode === 'edit'. */
  milestoneId?: string;
};

interface MilestoneQuickModalProps {
  target: MilestoneQuickTarget | null;
  onClose: () => void;
}

type FormValues = {
  name: string;
  deadlineDate: Dayjs;
  quantity?: number | null;
  unit?: MilestoneUnit | null;
  note?: string;
  completed?: boolean;
};

const toInputFromExisting = (item: ProjectMilestone): ProjectMilestoneInput => ({
  id: item.id,
  name: item.name,
  deadlineDate: toMilestoneDateKey(item.deadlineDate),
  quantity: item.quantity,
  unit: isSlidesOrDaUnit(item.unit) || item.unit === 'others' ? item.unit : 'others',
  note: item.note ?? '',
  completed: Boolean(item.completed),
});

export function MilestoneQuickModal({ target, onClose }: MilestoneQuickModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { mutate, isPending } = useReplaceProjectMilestones();
  const watchedUnit = Form.useWatch('unit', form);

  useEffect(() => {
    if (!target) return;
    const existing =
      target.mode === 'edit' && target.milestoneId
        ? target.milestones.find((item) => item.id === target.milestoneId)
        : undefined;

    form.setFieldsValue({
      name: existing?.name ?? '',
      deadlineDate: dayjs(existing?.deadlineDate ?? target.deadlineDate),
      quantity: existing?.quantity ?? undefined,
      unit:
        existing && (isSlidesOrDaUnit(existing.unit) || existing.unit === 'others')
          ? existing.unit
          : 'others',
      note: existing?.note ?? '',
      completed: Boolean(existing?.completed),
    });
  }, [target, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: FormValues) => {
    if (!target) return;

    const unit = isSlidesOrDaUnit(values.unit) || values.unit === 'others' ? values.unit : 'others';
    const quantity =
      unit && values.quantity != null && !Number.isNaN(Number(values.quantity))
        ? Number(values.quantity)
        : null;

    const nextItem: ProjectMilestoneInput = {
      name: values.name.trim(),
      deadlineDate: toMilestoneDateKey(values.deadlineDate.toISOString()),
      quantity,
      unit,
      note: values.note?.trim() ?? '',
      completed: target.mode === 'edit' ? Boolean(values.completed) : false,
    };
    if (target.mode === 'edit' && target.milestoneId) {
      nextItem.id = target.milestoneId;
    }

    const withoutEdited =
      target.mode === 'edit' && target.milestoneId
        ? target.milestones.filter((item) => item.id !== target.milestoneId)
        : target.milestones;

    const nextMilestones: ProjectMilestoneInput[] = [
      ...withoutEdited.map(toInputFromExisting),
      nextItem,
    ];

    const check = validateMilestones(nextMilestones, {
      startDate: target.startDate,
      endDate: target.endDate,
    });
    if (!check.ok) {
      message.error(check.message);
      return;
    }

    mutate(
      {
        projectId: target.projectId,
        milestones: toReplaceMilestonePayload(nextMilestones),
        successMessage:
          target.mode === 'create' ? 'Đã thêm mốc bàn giao' : 'Đã cập nhật mốc bàn giao',
      },
      {
        onSuccess: () => handleClose(),
      },
    );
  };

  const handleDelete = () => {
    if (!target?.milestoneId) return;

    const nextMilestones: ProjectMilestoneInput[] = target.milestones
      .filter((item) => item.id !== target.milestoneId)
      .map(toInputFromExisting);

    const check = validateMilestones(nextMilestones, {
      startDate: target.startDate,
      endDate: target.endDate,
    });
    if (!check.ok) {
      message.error(check.message);
      return;
    }

    mutate(
      {
        projectId: target.projectId,
        milestones: toReplaceMilestonePayload(nextMilestones),
        successMessage: 'Đã xóa mốc bàn giao',
      },
      {
        onSuccess: () => handleClose(),
      },
    );
  };

  const start = target ? dayjs(target.startDate) : null;
  const end = target ? dayjs(target.endDate) : null;
  const volumeRequired = isSlidesOrDaUnit(watchedUnit);

  return (
    <Modal
      title={
        target?.mode === 'edit'
          ? `Sửa mốc — ${target.projectName}`
          : `Thêm mốc — ${target?.projectName ?? ''}`
      }
      open={Boolean(target)}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText={target?.mode === 'edit' ? 'Lưu' : 'Thêm mốc'}
      confirmLoading={isPending}
      destroyOnHidden
      width={480}
      footer={(_, { OkBtn, CancelBtn }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {target?.mode === 'edit' ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#dc2626',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Xóa mốc
              </button>
            ) : null}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <CancelBtn />
            <OkBtn />
          </div>
        </div>
      )}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        initialValues={{ unit: 'others' }}
      >
        <Form.Item
          name="name"
          label={milestoneFieldLabel('Tên mốc', true)}
          rules={[{ required: true, message: 'Tên mốc là bắt buộc' }]}
        >
          <Input placeholder="VD: Nộp nháp, Deadline đợt 1" />
        </Form.Item>
        <Form.Item
          name="deadlineDate"
          label={milestoneFieldLabel('Ngày deadline', true)}
          rules={[{ required: true, message: 'Ngày deadline là bắt buộc' }]}
        >
          <DatePicker
            format={DATE_FORMAT}
            style={{ width: '100%' }}
            disabledDate={(current) => {
              if (!current) return false;
              if (start && current.isBefore(start, 'day')) return true;
              if (end && current.isAfter(end, 'day')) return true;
              return false;
            }}
          />
        </Form.Item>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item name="unit" label={milestoneFieldLabel('Đơn vị')}>
            <Select
              options={MILESTONE_UNITS.map((unit) => ({
                value: unit,
                label: MILESTONE_UNIT_LABELS[unit],
              }))}
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label={milestoneFieldLabel('Khối lượng', volumeRequired)}
            rules={
              volumeRequired
                ? [
                    { required: true, message: 'Khối lượng là bắt buộc khi chọn đơn vị' },
                    {
                      type: 'integer',
                      min: 1,
                      message: 'Khối lượng phải là số nguyên ≥ 1',
                    },
                  ]
                : undefined
            }
          >
            <InputNumber
              min={1}
              step={1}
              precision={0}
              style={{ width: '100%' }}
              placeholder="Số nguyên"
            />
          </Form.Item>
        </div>
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Không bắt buộc" />
        </Form.Item>
        {target?.mode === 'edit' ? (
          <Form.Item name="completed" valuePropName="checked">
            <Checkbox>Hoàn thành</Checkbox>
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}
