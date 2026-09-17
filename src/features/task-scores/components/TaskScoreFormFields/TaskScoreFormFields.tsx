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
  /** Per-task department; independent of group. */
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

  // When the user switches group, suggest that group's default department.
  // Skip the first paint so create/edit can seed department from parent values.
  useEffect(() => {
    if (!selectedGroup) {
      lastSyncedGroupRef.current = undefined;
      return;
    }

    const group = groupByCode[selectedGroup];
    if (!group) return;

    const previousGroup = lastSyncedGroupRef.current;
    lastSyncedGroupRef.current = selectedGroup;

    if (previousGroup === undefined || previousGroup === selectedGroup) return;

    // Suggest group default only when department is unset — never overwrite a
    // value already chosen for this task.
    const current = form.getFieldValue('department');
    if (current != null && current !== '') return;

    form.setFieldValue('department', group.department ?? null);
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
        />
      </Form.Item>
    </>
  );
}
