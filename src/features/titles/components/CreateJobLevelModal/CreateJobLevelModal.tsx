import { Form, Input, Modal } from 'antd';
import { useCreateJobLevel } from '../../hooks/useCreateJobLevel';
import type { CreateJobLevelRequest } from '../../schemas/title.schema';

interface CreateJobLevelModalProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: CreateJobLevelRequest = {
  code: '',
  label: '',
};

export function CreateJobLevelModal({ open, onClose }: CreateJobLevelModalProps) {
  const [form] = Form.useForm<CreateJobLevelRequest>();
  const { mutate, isPending } = useCreateJobLevel();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: CreateJobLevelRequest) => {
    mutate(values, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Create job level"
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
        initialValues={defaultValues}
        requiredMark={false}
      >
        <Form.Item
          name="code"
          label="Code"
          rules={[{ required: true, message: 'Code is required' }]}
          extra="Stored in uppercase, e.g. JUNIOR"
        >
          <Input placeholder="e.g. JUNIOR" />
        </Form.Item>

        <Form.Item
          name="label"
          label="Label"
          rules={[{ required: true, message: 'Label is required' }]}
        >
          <Input placeholder="e.g. Junior" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
