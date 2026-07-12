import { Form, Input, InputNumber, Select } from 'antd';
import { useEffect, useRef } from 'react';
import { DEPARTMENT_OPTIONS } from '@/features/projects/constants';
import type { ProjectDepartment } from '@/features/projects/schemas/project.schema';
import { useTaskScoreGroupOptions } from '../../hooks/useTaskScoreGroupOptions';
import type { CreateTaskScoreRequest } from '../../schemas/taskScore.schema';

export type TaskScoreFormValues = CreateTaskScoreRequest & {
  /** Department of the selected group (updated via group PATCH on save). */
  department?: ProjectDepartment | null;
};

export function TaskScoreFormFields() {
  const form = Form.useFormInstance<TaskScoreFormValues>();
  const { options, groupByCode, isLoading } = useTaskScoreGroupOptions();
  const selectedGroup = Form.useWatch('group', form);
  const lastSyncedGroupRef = useRef<string | undefined>(undefined);

  // Sync department when the selected group changes, or when group data arrives later.
  useEffect(() => {
    if (!selectedGroup) {
      lastSyncedGroupRef.current = undefined;
      form.setFieldValue('department', undefined);
      return;
    }

    const group = groupByCode[selectedGroup];
    if (!group) return;

    const groupChanged = lastSyncedGroupRef.current !== selectedGroup;
    const waitingForDept =
      lastSyncedGroupRef.current === selectedGroup &&
      form.getFieldValue('department') == null &&
      group.department != null;

    if (!groupChanged && !waitingForDept) return;

    lastSyncedGroupRef.current = selectedGroup;
    form.setFieldValue('department', group.department ?? undefined);
  }, [selectedGroup, groupByCode, form]);

  return (
    <>
      <Form.Item
        name="name"
        label="Task name"
        rules={[{ required: true, message: 'Task name is required' }]}
      >
        <Input placeholder="e.g. Slides 1" />
      </Form.Item>

      <Form.Item
        name="score"
        label="Score"
        rules={[{ required: true, message: 'Score is required' }]}
      >
        <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="e.g. 180" />
      </Form.Item>

      <Form.Item
        name="group"
        label="Group"
        rules={[{ required: true, message: 'Group is required' }]}
      >
        <Select
          placeholder="Select group"
          options={options}
          loading={isLoading}
          notFoundContent="No groups — add one from Manage groups"
        />
      </Form.Item>

      <Form.Item name="department" label="Department">
        <Select
          allowClear
          placeholder="No department"
          options={[...DEPARTMENT_OPTIONS]}
          disabled={!selectedGroup}
        />
      </Form.Item>
    </>
  );
}
