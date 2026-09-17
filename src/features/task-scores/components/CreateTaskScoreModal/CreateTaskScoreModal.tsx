import { Form, Modal } from 'antd';
import { useEffect } from 'react';
import { useCreateTaskScore } from '../../hooks/useCreateTaskScore';
import { useTaskScoreGroupOptions } from '../../hooks/useTaskScoreGroupOptions';
import { resolveTaskType } from '../../utils/resolveTaskType';
import {
  TaskScoreFormFields,
  type TaskScoreFormValues,
} from '../TaskScoreFormFields/TaskScoreFormFields';

interface CreateTaskScoreModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTaskScoreModal({ open, onClose }: CreateTaskScoreModalProps) {
  const [form] = Form.useForm<TaskScoreFormValues>();
  const { mutateAsync: createScore, isPending } = useCreateTaskScore();
  const { defaultGroupCode, groupByCode } = useTaskScoreGroupOptions();

  useEffect(() => {
    if (!open || !defaultGroupCode) return;
    const group = groupByCode[defaultGroupCode];
    form.setFieldsValue({
      taskType: '',
      name: '',
      score: 0,
      group: defaultGroupCode,
      department: group?.department ?? null,
    });
  }, [open, defaultGroupCode, form, groupByCode]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: TaskScoreFormValues) => {
    const { taskType, name, score, group: groupCode, department } = values;

    try {
      await createScore({
        taskType: resolveTaskType(taskType, name),
        name,
        score,
        group: groupCode,
        department: department ?? null,
      });
    } catch {
      // Error toast handled by mutation hook.
      return;
    }

    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create task"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Create"
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <TaskScoreFormFields />
      </Form>
    </Modal>
  );
}
