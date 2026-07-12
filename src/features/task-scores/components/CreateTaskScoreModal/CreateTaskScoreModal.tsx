import { Form, Modal } from 'antd';
import { useEffect } from 'react';
import { useCreateTaskScore } from '../../hooks/useCreateTaskScore';
import { useTaskScoreGroupOptions } from '../../hooks/useTaskScoreGroupOptions';
import { useUpdateTaskScoreGroup } from '../../hooks/useUpdateTaskScoreGroup';
import { sameDepartment } from '../../utils/sameDepartment';
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
  const { mutateAsync: updateGroup, isPending: isUpdatingGroup } = useUpdateTaskScoreGroup();
  const { defaultGroupCode, groupByCode } = useTaskScoreGroupOptions();

  useEffect(() => {
    if (!open || !defaultGroupCode) return;
    const group = groupByCode[defaultGroupCode];
    form.setFieldsValue({
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
    const { department, name, score, group: groupCode } = values;
    const group = groupByCode[groupCode];
    const nextDepartment = department ?? null;
    const shouldUpdateGroup = Boolean(group) && !sameDepartment(group?.department, nextDepartment);

    try {
      // Score first so a failed create cannot leave a half-applied group change.
      await createScore({ name, score, group: groupCode });
    } catch {
      // Error toast handled by mutation hook.
      return;
    }

    try {
      if (shouldUpdateGroup && group) {
        await updateGroup({ id: group.id, payload: { department: nextDepartment } });
      }
    } catch {
      // Score already saved; department toast handled by mutation hook.
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
      confirmLoading={isPending || isUpdatingGroup}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <TaskScoreFormFields />
      </Form>
    </Modal>
  );
}
