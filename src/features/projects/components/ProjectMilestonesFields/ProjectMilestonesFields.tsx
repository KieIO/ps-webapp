import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import {
  MILESTONE_UNIT_LABELS,
  MILESTONE_UNITS,
  isSlidesOrDaUnit,
  type MilestoneUnit,
} from '../../schemas/milestone.schema';
import { milestoneFieldLabel } from '../../utils/milestoneFieldLabel';
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
  /** Only Edit Project / edit milestone — hide on Create project. */
  showCompleted?: boolean;
}

export function ProjectMilestonesFields({
  startDate,
  endDate,
  disabled,
  showCompleted = false,
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
                showCompleted={showCompleted}
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
                  unit: 'others',
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
  showCompleted,
  onRemove,
}: {
  field: { key: number; name: number };
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  disabled?: boolean;
  showCompleted: boolean;
  onRemove: () => void;
}) {
  const form = Form.useFormInstance();
  const unit = Form.useWatch(['milestones', field.name, 'unit'], form) as
    | MilestoneUnit
    | ''
    | undefined;
  const volumeRequired = isSlidesOrDaUnit(unit);

  return (
    <div className={localStyles.card}>
      <div className={styles.row}>
        <Form.Item
          name={[field.name, 'name']}
          label={milestoneFieldLabel('Tên mốc', true)}
          rules={[{ required: true, message: 'Tên mốc là bắt buộc' }]}
        >
          <Input placeholder="VD: Nộp nháp, Deadline đợt 1" disabled={disabled} />
        </Form.Item>
        <Form.Item
          name={[field.name, 'deadlineDate']}
          label={milestoneFieldLabel('Ngày deadline', true)}
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
        <Form.Item name={[field.name, 'unit']} label={milestoneFieldLabel('Đơn vị')}>
          <Select
            disabled={disabled}
            options={MILESTONE_UNITS.map((item) => ({
              value: item,
              label: MILESTONE_UNIT_LABELS[item],
            }))}
          />
        </Form.Item>
        <Form.Item
          name={[field.name, 'quantity']}
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
            disabled={disabled}
            placeholder="Số nguyên"
          />
        </Form.Item>
        <Form.Item name={[field.name, 'note']} label="Ghi chú">
          <Input placeholder="Không bắt buộc" disabled={disabled} />
        </Form.Item>
      </div>
      {showCompleted ? (
        <Form.Item name={[field.name, 'completed']} valuePropName="checked">
          <Checkbox disabled={disabled}>Hoàn thành</Checkbox>
        </Form.Item>
      ) : null}
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
