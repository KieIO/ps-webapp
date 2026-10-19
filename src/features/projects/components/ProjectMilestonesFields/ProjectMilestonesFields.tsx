import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import {
  MILESTONE_UNIT_LABELS,
  MILESTONE_UNITS,
  type MilestoneUnit,
} from '../../schemas/milestone.schema';
import styles from '../EditProjectModal/EditProjectModal.module.scss';
import localStyles from './ProjectMilestonesFields.module.scss';

export type MilestoneFormRow = {
  id?: string;
  name: string;
  deadlineDate: Dayjs;
  quantity?: number | null;
  unit?: MilestoneUnit | '';
  note?: string;
  completed?: boolean;
};

interface ProjectMilestonesFieldsProps {
  /** Inclusive project date bounds for the deadline picker. */
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  disabled?: boolean;
}

export function ProjectMilestonesFields({
  startDate,
  endDate,
  disabled,
}: ProjectMilestonesFieldsProps) {
  return (
    <section className={styles.section}>
      <p className={styles.sectionTitle}>Mốc bàn giao</p>
      <Form.List name="milestones">
        {(fields, { add, remove }) => (
          <div className={localStyles.list}>
            {fields.map((field) => (
              <MilestoneRow
                key={field.key}
                field={field}
                startDate={startDate}
                endDate={endDate}
                disabled={disabled}
                onRemove={() => remove(field.name)}
              />
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                add({
                  name: '',
                  deadlineDate: startDate ?? undefined,
                  quantity: null,
                  unit: undefined,
                  note: '',
                  completed: false,
                })
              }
              disabled={disabled}
              block
            >
              Thêm mốc
            </Button>
          </div>
        )}
      </Form.List>
    </section>
  );
}

function MilestoneRow({
  field,
  startDate,
  endDate,
  disabled,
  onRemove,
}: {
  field: { key: number; name: number };
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  disabled?: boolean;
  onRemove: () => void;
}) {
  const form = Form.useFormInstance();
  const unit = Form.useWatch(['milestones', field.name, 'unit'], form) as
    | MilestoneUnit
    | ''
    | undefined;
  const volumeRequired = unit === 'slides' || unit === 'da';

  return (
    <div className={localStyles.card}>
      <div className={styles.row}>
        <Form.Item
          name={[field.name, 'name']}
          label="Tên mốc"
          rules={[{ required: true, message: 'Tên mốc là bắt buộc' }]}
        >
          <Input placeholder="VD: Nộp nháp, Deadline đợt 1" disabled={disabled} />
        </Form.Item>
        <Form.Item
          name={[field.name, 'deadlineDate']}
          label="Ngày deadline"
          rules={[{ required: true, message: 'Ngày deadline là bắt buộc' }]}
        >
          <DatePicker
            format={DATE_FORMAT}
            style={{ width: '100%' }}
            disabled={disabled}
            disabledDate={(current) => {
              if (!current) return false;
              if (startDate && current.isBefore(startDate, 'day')) return true;
              if (endDate && current.isAfter(endDate, 'day')) return true;
              return false;
            }}
          />
        </Form.Item>
      </div>
      <div className={styles.rowThree}>
        <Form.Item
          name={[field.name, 'quantity']}
          label="Khối lượng"
          rules={
            volumeRequired
              ? [{ required: true, message: 'Khối lượng là bắt buộc khi chọn đơn vị' }]
              : undefined
          }
        >
          <InputNumber
            min={0.1}
            step={1}
            style={{ width: '100%' }}
            disabled={disabled || !volumeRequired}
            placeholder="Tuỳ chọn"
          />
        </Form.Item>
        <Form.Item name={[field.name, 'unit']} label="Đơn vị">
          <Select
            allowClear
            disabled={disabled}
            placeholder="Slides / DA (tuỳ chọn)"
            options={MILESTONE_UNITS.map((item) => ({
              value: item,
              label: MILESTONE_UNIT_LABELS[item],
            }))}
            onChange={(value) => {
              if (!value) {
                form.setFieldValue(['milestones', field.name, 'quantity'], null);
              }
            }}
          />
        </Form.Item>
        <Form.Item name={[field.name, 'note']} label="Ghi chú">
          <Input placeholder="Không bắt buộc" disabled={disabled} />
        </Form.Item>
      </div>
      <Form.Item name={[field.name, 'completed']} valuePropName="checked">
        <Checkbox disabled={disabled}>Hoàn thành</Checkbox>
      </Form.Item>
      <Form.Item name={[field.name, 'id']} hidden>
        <Input />
      </Form.Item>
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={onRemove}
        disabled={disabled}
        className={localStyles.removeBtn}
      >
        Xóa mốc
      </Button>
    </div>
  );
}
