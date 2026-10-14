import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd';
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
  quantity: number;
  unit: MilestoneUnit;
  note?: string;
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
              <div key={field.key} className={localStyles.card}>
                <div className={styles.row}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'name']}
                    label="Tên mốc"
                    rules={[{ required: true, message: 'Tên mốc là bắt buộc' }]}
                  >
                    <Input placeholder="VD: Nộp nháp, Deadline đợt 1" disabled={disabled} />
                  </Form.Item>
                  <Form.Item
                    {...field}
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
                    {...field}
                    name={[field.name, 'quantity']}
                    label="Khối lượng"
                    rules={[{ required: true, message: 'Khối lượng là bắt buộc' }]}
                  >
                    <InputNumber min={0.1} step={1} style={{ width: '100%' }} disabled={disabled} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'unit']}
                    label="Đơn vị"
                    rules={[{ required: true, message: 'Đơn vị là bắt buộc' }]}
                    initialValue={'slides' satisfies MilestoneUnit}
                  >
                    <Select
                      disabled={disabled}
                      options={MILESTONE_UNITS.map((unit) => ({
                        value: unit,
                        label: MILESTONE_UNIT_LABELS[unit],
                      }))}
                    />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'note']} label="Ghi chú">
                    <Input placeholder="Không bắt buộc" disabled={disabled} />
                  </Form.Item>
                </div>
                <Form.Item {...field} name={[field.name, 'id']} hidden>
                  <Input />
                </Form.Item>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(field.name)}
                  disabled={disabled}
                  className={localStyles.removeBtn}
                >
                  Xóa mốc
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                add({
                  name: '',
                  deadlineDate: startDate ?? undefined,
                  quantity: 10,
                  unit: 'slides' as MilestoneUnit,
                  note: '',
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
