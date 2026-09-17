import { Form, Modal } from 'antd';
import { useEffect } from 'react';
import { useUpdateTaskScore } from '../../hooks/useUpdateTaskScore';
import type { TaskScore } from '../../schemas/taskScore.schema';
import { resolveTaskType } from '../../utils/resolveTaskType';
import {
  TaskScoreFormFields,
  type TaskScoreFormValues,
} from '../TaskScoreFormFields/TaskScoreFormFields';

interface EditTaskScoreModalProps {
  open: boolean;
  task: TaskScore | null;
  onClose: () => void;
}

export function EditTaskScoreModal({ open, task, onClose }: EditTaskScoreModalProps) {
  const [form] = Form.useForm<TaskScoreFormValues>();
  const { mutateAsync: updateScore, isPending } = useUpdateTaskScore();

  useEffect(() => {
    if (!open || !task) return;
    form.setFieldsValue({
      taskType: resolveTaskType(task.taskType, task.name),
      name: task.name,
      score: task.score,
      group: task.group,
      department: task.department ?? null,
    });
  }, [form, open, task]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: TaskScoreFormValues) => {
    if (!task) return;

    const { taskType, name, score, group: groupCode, department } = values;

    try {
      await updateScore({
        id: task.id,
        payload: {
          taskType: resolveTaskType(taskType, name),
          name,
          score,
          group: groupCode,
          department: department ?? null,
        },
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
      title="Edit task"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Save"
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <TaskScoreFormFields />
      </Form>
    </Modal>
  );
}
