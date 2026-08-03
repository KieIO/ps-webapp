import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';
import { useCreateClient, useUpdateClient } from '../../hooks/useClients';
import type { Client, CreateClientRequest, UpdateClientRequest } from '../../schemas/client.schema';

interface ClientFormModalProps {
  open: boolean;
  client?: Client | null;
  onClose: () => void;
}

type FormValues = {
  name: string;
};

export function ClientFormModal({ open, client, onClose }: ClientFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();
  const isEdit = Boolean(client);
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (client) {
      form.setFieldsValue({ name: client.name });
      return;
    }
    form.resetFields();
  }, [open, client, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: FormValues) => {
    if (isEdit && client) {
      const payload: UpdateClientRequest = { name: values.name };
      updateClient(
        { id: client.id, payload },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        },
      );
      return;
    }

    const payload: CreateClientRequest = { name: values.name };
    createClient(payload, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title={isEdit ? 'Edit client' : 'Create client'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="e.g. ALLIANZ" autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
