import { Button, Form, Input, Modal, Popconfirm } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useCreateTaskScoreGroup } from '../../hooks/useCreateTaskScoreGroup';
import { useDeleteTaskScoreGroup } from '../../hooks/useDeleteTaskScoreGroup';
import { useTaskScoreGroupList } from '../../hooks/useTaskScoreGroupList';
import type {
  CreateTaskScoreGroupRequest,
  TaskScoreGroupRecord,
} from '../../schemas/taskScoreGroup.schema';
import { TaskScoreGroupPill } from '../TaskScoreGroupPill/TaskScoreGroupPill';
import styles from './ManageTaskScoreGroupsModal.module.scss';

interface ManageTaskScoreGroupsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ManageTaskScoreGroupsModal({ open, onClose }: ManageTaskScoreGroupsModalProps) {
  const [form] = Form.useForm<CreateTaskScoreGroupRequest>();
  const { data, isLoading } = useTaskScoreGroupList();
  const { mutate: createGroup, isPending: isCreating } = useCreateTaskScoreGroup();
  const { mutate: deleteGroup, isPending: isDeleting, variables: deletingId } =
    useDeleteTaskScoreGroup();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: CreateTaskScoreGroupRequest) => {
    createGroup(values, {
      onSuccess: () => {
        form.resetFields();
      },
    });
  };

  const handleDelete = (group: TaskScoreGroupRecord) => {
    deleteGroup(group.id);
  };

  return (
    <Modal
      title="Task groups"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      destroyOnHidden
    >
      <p className={styles.intro}>
        Groups classify task scores. Remove unused groups with the × button.
      </p>

      <div className={styles.groupPanel}>
        {isLoading ? (
          <span className={styles.empty}>Loading…</span>
        ) : data?.items.length ? (
          data.items.map((group) => (
            <div key={group.id} className={styles.groupItem}>
              <TaskScoreGroupPill label={group.label} colorKey={group.colorKey} />
              <Popconfirm
                title={`Delete "${group.label}"?`}
                description="Only groups with no tasks can be removed."
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(group)}
              >
                <Button
                  type="text"
                  size="small"
                  className={styles.removeButton}
                  icon={<CloseOutlined />}
                  aria-label={`Delete ${group.label}`}
                  loading={isDeleting && deletingId === group.id}
                  disabled={isCreating}
                />
              </Popconfirm>
            </div>
          ))
        ) : (
          <span className={styles.empty}>No groups yet</span>
        )}
      </div>

      <Form
        form={form}
        layout="inline"
        className={styles.form}
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          name="label"
          className={styles.input}
          rules={[{ required: true, message: 'Enter a group name' }]}
        >
          <Input placeholder="e.g. Research" disabled={isCreating || isDeleting} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={isCreating} disabled={isDeleting}>
          Add group
        </Button>
      </Form>
    </Modal>
  );
}
