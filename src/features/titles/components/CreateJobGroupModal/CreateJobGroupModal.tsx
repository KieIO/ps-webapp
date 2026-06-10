import { Form, Input, Modal } from 'antd';
import { useCreateJobGroup } from '../../hooks/useCreateJobGroup';
import type { CreateJobGroupRequest } from '../../schemas/title.schema';

interface CreateJobGroupModalProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: CreateJobGroupRequest = {
  code: '',
  label: '',
};

export function CreateJobGroupModal({ open, onClose }: CreateJobGroupModalProps) {
  const [form] = Form.useForm<CreateJobGroupRequest>();
  const { mutate, isPending } = useCreateJobGroup();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: CreateJobGroupRequest) => {
    mutate(values, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Create job group"
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
          extra="Stored in uppercase, e.g. STAFF"
        >
          <Input placeholder="e.g. STAFF" />
        </Form.Item>

        <Form.Item
          name="label"
          label="Label"
          rules={[{ required: true, message: 'Label is required' }]}
        >
          <Input placeholder="e.g. Staff" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
