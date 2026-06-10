import { Form, Modal } from 'antd';
import { useEffect } from 'react';
import { useCreateTaskScore } from '../../hooks/useCreateTaskScore';
import { useTaskScoreGroupOptions } from '../../hooks/useTaskScoreGroupOptions';
import type { CreateTaskScoreRequest } from '../../schemas/taskScore.schema';
import { TaskScoreFormFields } from '../TaskScoreFormFields/TaskScoreFormFields';

interface CreateTaskScoreModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTaskScoreModal({ open, onClose }: CreateTaskScoreModalProps) {
  const [form] = Form.useForm<CreateTaskScoreRequest>();
  const { mutate, isPending } = useCreateTaskScore();
  const { defaultGroupCode } = useTaskScoreGroupOptions();

  useEffect(() => {
    if (open && defaultGroupCode) {
      form.setFieldsValue({ name: '', score: 0, group: defaultGroupCode });
    }
  }, [open, defaultGroupCode, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: CreateTaskScoreRequest) => {
    mutate(values, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <TaskScoreFormFields />
      </Form>
    </Modal>
  );
}
