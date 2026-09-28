import { Alert, Segmented } from 'antd';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath } from '@/config/constants';
import type { MyTask } from '../../schemas/task.schema';
import {
  CREATIVE_ASSIGN_MODE_OPTIONS,
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
  /** When false, whole-mode staff is read-only (no reassign form below). */
  showReassignHint?: boolean;
}

export function CreativeAssignModeSection({
  task,
  allTasks,
  showReassignHint = false,
}: CreativeAssignModeSectionProps) {
  const assignMode = resolveCreativeAssignMode(task);
  const subtasks = assignMode === 'split' ? getCreativeSplitSubtasks(task, allTasks) : [];
  const wholeStaff = resolveWholeAssignStaff(task);
  const allocated = sumSplitChildrenQuantity(subtasks);
  const conserved = isSplitQuantityConserved(task.quantity, subtasks);

  return (
    <>
      <p className={styles.sectionLabel}>Hình thức giao</p>

      {assignMode == null ? (
        <Alert
          type="info"
          showIcon
          className={styles.banner}
          message="Chưa giao Staff"
          description="Dùng nút Giao cho Staff trên queue để chọn giao nguyên task hoặc chia thành task nhỏ."
        />
      ) : (
        <>
          <Segmented
            block
            disabled
            className={styles.modeToggle}
            value={assignMode}
            options={CREATIVE_ASSIGN_MODE_OPTIONS}
          />
          <Alert
            type="info"
            showIcon
            className={styles.banner}
            message="Hình thức giao đã khóa"
            description={
              assignMode === 'split'
                ? `SL tổng ${task.quantity} đã khoá (đã phân ${allocated}). Không gộp lại nguyên task — chỉnh từng task nhỏ bên dưới.`
                : 'Không chuyển sang chia nhỏ sau khi đã giao nguyên task. Có thể đổi Staff bên dưới (nếu được phép).'
            }
          />

          {assignMode === 'whole' ? (
            <div className={styles.contextCard}>
              <p className={styles.contextMeta}>Staff nhận task</p>
              <p className={styles.contextTitle}>
                {wholeStaff.length > 0 ? wholeStaff.map((member) => member.name).join(', ') : '—'}
              </p>
              {showReassignHint ? (
                <p className={styles.note}>Chọn Staff mới ở mục Đổi Staff nhận task bên dưới.</p>
              ) : null}
            </div>
          ) : (
            <>
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
                  description={`Staff đã giao: ${wholeStaff.map((m) => m.name).join(', ') || '—'}. Xem task con trong My Tasks (mã ${task.taskCode}-S…).`}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
