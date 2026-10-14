import { DatePicker, Form, Input, InputNumber, Modal, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import {
  MILESTONE_UNIT_LABELS,
  MILESTONE_UNITS,
  type ProjectMilestone,
  type ProjectMilestoneInput,
  type MilestoneUnit,
} from '@/features/projects/schemas/milestone.schema';
import { useReplaceProjectMilestones } from '@/features/projects/hooks/useReplaceProjectMilestones';
import { validateMilestones } from '@/features/projects/utils/milestoneValidation';
import { toMilestoneDateKey } from '@/features/projects/utils/milestoneValidation';

export type MilestoneQuickMode = 'create' | 'edit';

export type MilestoneQuickTarget = {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  totalSlides: number;
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
  quantity: number;
  unit: MilestoneUnit;
  note?: string;
};

export function MilestoneQuickModal({ target, onClose }: MilestoneQuickModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { mutate, isPending } = useReplaceProjectMilestones();

  useEffect(() => {
    if (!target) return;
    const existing =
      target.mode === 'edit' && target.milestoneId
        ? target.milestones.find((item) => item.id === target.milestoneId)
        : undefined;

    form.setFieldsValue({
      name: existing?.name ?? '',
      deadlineDate: dayjs(existing?.deadlineDate ?? target.deadlineDate),
      quantity: existing?.quantity ?? 10,
      unit: existing?.unit ?? 'slides',
      note: existing?.note ?? '',
    });
  }, [target, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: FormValues) => {
    if (!target) return;

    const nextItem: ProjectMilestoneInput = {
      id: target.mode === 'edit' ? target.milestoneId : undefined,
      name: values.name.trim(),
      deadlineDate: toMilestoneDateKey(values.deadlineDate.toISOString()),
      quantity: Number(values.quantity),
      unit: values.unit,
      note: values.note?.trim() ?? '',
    };

    const withoutEdited =
      target.mode === 'edit' && target.milestoneId
        ? target.milestones.filter((item) => item.id !== target.milestoneId)
        : target.milestones;

    const nextMilestones: ProjectMilestoneInput[] = [
      ...withoutEdited.map((item) => ({
        id: item.id,
        name: item.name,
        deadlineDate: toMilestoneDateKey(item.deadlineDate),
        quantity: item.quantity,
        unit: item.unit,
        note: item.note ?? '',
      })),
      nextItem,
    ];

    const check = validateMilestones(nextMilestones, {
      startDate: target.startDate,
      endDate: target.endDate,
      totalSlides: target.totalSlides,
    });
    if (!check.ok) {
      message.error(check.message);
      return;
    }

    mutate(
      {
        projectId: target.projectId,
        milestones: nextMilestones,
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
      .map((item) => ({
        id: item.id,
        name: item.name,
        deadlineDate: toMilestoneDateKey(item.deadlineDate),
        quantity: item.quantity,
        unit: item.unit,
        note: item.note ?? '',
      }));

    const check = validateMilestones(nextMilestones, {
      startDate: target.startDate,
      endDate: target.endDate,
      totalSlides: target.totalSlides,
    });
    if (!check.ok) {
      message.error(check.message);
      return;
    }

    mutate(
      {
        projectId: target.projectId,
        milestones: nextMilestones,
        successMessage: 'Đã xóa mốc bàn giao',
      },
      {
        onSuccess: () => handleClose(),
      },
    );
  };

  const start = target ? dayjs(target.startDate) : null;
  const end = target ? dayjs(target.endDate) : null;

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
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="name"
          label="Tên mốc"
          rules={[{ required: true, message: 'Tên mốc là bắt buộc' }]}
        >
          <Input placeholder="VD: Nộp nháp, Deadline đợt 1" />
        </Form.Item>
        <Form.Item
          name="deadlineDate"
          label="Ngày deadline"
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
          <Form.Item
            name="quantity"
            label="Khối lượng"
            rules={[{ required: true, message: 'Khối lượng là bắt buộc' }]}
          >
            <InputNumber min={0.1} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="unit"
            label="Đơn vị"
            rules={[{ required: true, message: 'Đơn vị là bắt buộc' }]}
          >
            <Select
              options={MILESTONE_UNITS.map((unit) => ({
                value: unit,
                label: MILESTONE_UNIT_LABELS[unit],
              }))}
            />
          </Form.Item>
        </div>
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Không bắt buộc" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
