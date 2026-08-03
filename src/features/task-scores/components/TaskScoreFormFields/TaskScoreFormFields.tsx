import { Form, Input, InputNumber, Select } from 'antd';
import { useEffect, useRef, type ChangeEvent } from 'react';
import { useDepartmentOptions } from '@/features/departments/hooks/useDepartmentOptions';
import { useTaskScoreGroupOptions } from '../../hooks/useTaskScoreGroupOptions';
import { resolveTaskType } from '../../utils/resolveTaskType';

export type TaskScoreFormValues = {
  taskType?: string;
  name: string;
  score: number;
  group: string;
  /** Department of the selected group (updated via group PATCH on save). */
  department?: string | null;
};

export function TaskScoreFormFields() {
  const form = Form.useFormInstance<TaskScoreFormValues>();
  const { options, groupByCode, isLoading } = useTaskScoreGroupOptions();
  const { options: departmentOptions, isLoading: departmentLoading } = useDepartmentOptions();
  const selectedGroup = Form.useWatch('group', form);
  const taskName = Form.useWatch('name', form);
  const lastSyncedGroupRef = useRef<string | undefined>(undefined);
  const lastDerivedTypeRef = useRef('');
  const taskTypeManualRef = useRef(false);

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

  // Auto-fill task type from task name unless the user edited task type manually.
  useEffect(() => {
    const derived = resolveTaskType(undefined, taskName ?? '');
    const current = String(form.getFieldValue('taskType') ?? '').trim();

    if (!taskTypeManualRef.current) {
      const shouldSync =
        current === '' || current === lastDerivedTypeRef.current || current === derived;
      if (shouldSync && current !== derived) {
        form.setFieldValue('taskType', derived);
      }
    }

    lastDerivedTypeRef.current = derived;
  }, [taskName, form]);

  return (
    <>
      <Form.Item
        name="taskType"
        label="Task type"
        getValueFromEvent={(event: ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          const derived = resolveTaskType(undefined, form.getFieldValue('name') ?? '');
          taskTypeManualRef.current = value.trim() !== '' && value.trim() !== derived;
          return value;
        }}
      >
        <Input placeholder="e.g. Slides (defaults from task name)" />
      </Form.Item>

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
          options={departmentOptions}
          loading={departmentLoading}
          disabled={!selectedGroup}
        />
      </Form.Item>
    </>
  );
}
