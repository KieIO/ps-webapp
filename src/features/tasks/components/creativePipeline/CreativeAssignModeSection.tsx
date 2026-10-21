import { Alert } from 'antd';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath } from '@/config/constants';
import type { MyTask } from '../../schemas/task.schema';
import {
  getCreativeSplitSubtasks,
  isSplitQuantityConserved,
  resolveCreativeAssignMode,
  resolveWholeAssignStaff,
  sumSplitChildrenQuantity,
} from '../../utils/creativePipeline';
import styles from './creativePipeline.module.scss';

interface CreativeAssignModeSectionProps {
  task: MyTask;
  allTasks: MyTask[];
}

const wholeAssignSummary = (names: string[]): string =>
  names.length > 0 ? `Đã giao nguyên cho ${names.join(', ')}.` : 'Đã giao nguyên.';

export function CreativeAssignModeSection({ task, allTasks }: CreativeAssignModeSectionProps) {
  const assignMode = resolveCreativeAssignMode(task);
  const subtasks = assignMode === 'split' ? getCreativeSplitSubtasks(task, allTasks) : [];
  const wholeStaff = resolveWholeAssignStaff(task);
  const allocated = sumSplitChildrenQuantity(subtasks);
  const conserved = isSplitQuantityConserved(task.quantity, subtasks);

  if (assignMode == null) {
    return (
      <Alert
        type="info"
        showIcon
        className={styles.banner}
        message="Chưa giao Staff"
        description="Dùng nút Giao cho Staff trên queue để chọn giao nguyên hoặc chia nhỏ."
      />
    );
  }

  if (assignMode === 'whole') {
    return (
      <p className={styles.contextCard}>
        {wholeAssignSummary(wholeStaff.map((member) => member.name))}
      </p>
    );
  }

  return (
    <>
      <p className={styles.sectionLabel}>Đã chia nhỏ</p>
      {!conserved && subtasks.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          className={styles.banner}
          message="Tổng SL các phần lệch so với SL tổng"
          description={`Đã phân ${allocated} / tổng ${task.quantity}. Chỉnh SL từng task nhỏ cho khớp.`}
        />
      ) : null}
      {subtasks.length > 0 ? (
        subtasks.map((subtask, index) => (
          <div className={styles.subtaskCard} key={subtask.id}>
            <div className={styles.subtaskHeader}>
              <span>
                Task nhỏ {index + 1}: {subtask.taskName}
              </span>
              <Link to={buildMyTaskDetailPath(subtask.id)}>Mở</Link>
            </div>
            <p className={styles.contextMeta}>
              {subtask.taskCode}
              {subtask.staff[0]?.name ? ` · ${subtask.staff[0].name}` : ''}
              {subtask.quantity != null ? ` · SL: ${subtask.quantity}` : ''}
            </p>
          </div>
        ))
      ) : (
        <Alert
          type="warning"
          showIcon
          className={styles.banner}
          message="Chưa tải được danh sách task nhỏ"
          description={`Staff đã giao: ${wholeStaff.map((member) => member.name).join(', ') || '—'}. Xem task con trong My Tasks (mã ${task.taskCode}-S…).`}
        />
      )}
    </>
  );
}
