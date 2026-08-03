import { Form, Modal } from 'antd';
import { useEffect } from 'react';
import { useTaskScoreGroupOptions } from '../../hooks/useTaskScoreGroupOptions';
import { useUpdateTaskScore } from '../../hooks/useUpdateTaskScore';
import { useUpdateTaskScoreGroup } from '../../hooks/useUpdateTaskScoreGroup';
import type { TaskScore } from '../../schemas/taskScore.schema';
import { resolveTaskType } from '../../utils/resolveTaskType';
import { sameDepartment } from '../../utils/sameDepartment';
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
  const { mutateAsync: updateGroup, isPending: isUpdatingGroup } = useUpdateTaskScoreGroup();
  const { groupByCode } = useTaskScoreGroupOptions();

  useEffect(() => {
    if (!open || !task) return;
    const group = groupByCode[task.group];
    form.setFieldsValue({
      taskType: resolveTaskType(task.taskType, task.name),
      name: task.name,
      score: task.score,
      group: task.group,
      department: group?.department ?? null,
    });
  }, [form, open, task, groupByCode]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: TaskScoreFormValues) => {
    if (!task) return;

    const { department, taskType, name, score, group: groupCode } = values;
    const group = groupByCode[groupCode];
    const nextDepartment = department ?? null;
    const shouldUpdateGroup = Boolean(group) && !sameDepartment(group?.department, nextDepartment);

    try {
      // Score first so a failed update cannot leave a half-applied group change.
      await updateScore({
        id: task.id,
        payload: {
          taskType: resolveTaskType(taskType, name),
          name,
          score,
          group: groupCode,
        },
      });
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
      title="Edit task"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Save"
      confirmLoading={isPending || isUpdatingGroup}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <TaskScoreFormFields />
      </Form>
    </Modal>
  );
}
