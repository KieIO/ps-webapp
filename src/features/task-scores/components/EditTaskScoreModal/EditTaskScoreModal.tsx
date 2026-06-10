import { Form, Modal } from 'antd';
import { useEffect } from 'react';
import { useUpdateTaskScore } from '../../hooks/useUpdateTaskScore';
import type { TaskScore, UpdateTaskScoreRequest } from '../../schemas/taskScore.schema';
import { TaskScoreFormFields } from '../TaskScoreFormFields/TaskScoreFormFields';

interface EditTaskScoreModalProps {
  open: boolean;
  task: TaskScore | null;
  onClose: () => void;
}

export function EditTaskScoreModal({ open, task, onClose }: EditTaskScoreModalProps) {
  const [form] = Form.useForm<UpdateTaskScoreRequest>();
  const { mutate, isPending } = useUpdateTaskScore();

  useEffect(() => {
    if (open && task) {
      form.setFieldsValue({
        name: task.name,
        score: task.score,
        group: task.group,
      });
    }
  }, [form, open, task]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: UpdateTaskScoreRequest) => {
    if (!task) return;

    mutate(
      { id: task.id, payload: values },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      },
    );
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
