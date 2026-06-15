import { CapacityHelpTooltip } from '@/features/capacity/components/CapacityHelpTooltip/CapacityHelpTooltip';
import styles from './ReassignToHelpTooltip.module.scss';

function ReassignToTooltipContent() {
  return (
    <div className={styles.content}>
      <p className={styles.title}>Ai hiển thị trong danh sách?</p>
      <ul className={styles.list}>
        <li>Nhân viên <strong>Active</strong> cùng department với người nghỉ</li>
        <li>Task project → thêm nhân viên Active thuộc department của project</li>
        <li>Có job title → <strong>% capacity</strong> theo ngày task</li>
        <li>Chưa có job title → vẫn chọn được, capacity hiển thị <strong>—</strong></li>
      </ul>
    </div>
  );
}

export function ReassignToColumnTitle() {
  return (
    <span className={styles.columnHeader}>
      Reassign to
      <CapacityHelpTooltip
        title={<ReassignToTooltipContent />}
        ariaLabel="Giải thích danh sách Reassign to"
        placement="top"
      />
    </span>
  );
}
