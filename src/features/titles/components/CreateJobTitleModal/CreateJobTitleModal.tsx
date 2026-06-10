import { Form, Input, Modal, Select } from 'antd';
import { useJobGroupList } from '../../hooks/useJobGroupList';
import { useJobLevelList } from '../../hooks/useJobLevelList';
import { useCreateJobTitle } from '../../hooks/useCreateJobTitle';
import type { CreateJobTitleRequest } from '../../schemas/title.schema';

interface CreateJobTitleModalProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: CreateJobTitleRequest = {
  code: '',
  name: '',
  jobLevelId: '',
  jobGroupId: '',
};

export function CreateJobTitleModal({ open, onClose }: CreateJobTitleModalProps) {
  const [form] = Form.useForm<CreateJobTitleRequest>();
  const { mutate, isPending } = useCreateJobTitle();
  const { data: levels } = useJobLevelList();
  const { data: groups } = useJobGroupList();

  const levelOptions =
    levels?.items.map((level) => ({ value: level.id, label: `${level.code} — ${level.label}` })) ??
    [];

  const groupOptions =
    groups?.items.map((group) => ({ value: group.id, label: `${group.code} — ${group.label}` })) ??
    [];

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: CreateJobTitleRequest) => {
    mutate(values, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Create job title"
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
        >
          <Input placeholder="e.g. JPE-1" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Title"
          rules={[{ required: true, message: 'Title is required' }]}
        >
          <Input placeholder="e.g. Junior Project Executive Level 1" />
        </Form.Item>

        <Form.Item
          name="jobLevelId"
          label="Job level"
          rules={[{ required: true, message: 'Job level is required' }]}
        >
          <Select placeholder="Select job level" options={levelOptions} />
        </Form.Item>

        <Form.Item
          name="jobGroupId"
          label="Job group"
          rules={[{ required: true, message: 'Job group is required' }]}
        >
          <Select placeholder="Select job group" options={groupOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
