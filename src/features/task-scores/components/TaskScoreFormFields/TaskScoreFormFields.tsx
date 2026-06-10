import { Form, Input, InputNumber, Select } from 'antd';
import { useTaskScoreGroupOptions } from '../../hooks/useTaskScoreGroupOptions';

export function TaskScoreFormFields() {
  const { options, isLoading } = useTaskScoreGroupOptions();

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
    </>
  );
}
