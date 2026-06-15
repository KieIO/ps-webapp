import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import styles from './CapacityHelpTooltip.module.scss';

interface CapacityHelpTooltipProps {
  title: ReactNode;
  ariaLabel: string;
  placement?: 'top' | 'topLeft' | 'topRight';
}

export function CapacityHelpTooltip({
  title,
  ariaLabel,
  placement = 'topLeft',
}: CapacityHelpTooltipProps) {
  return (
    <Tooltip title={title} placement={placement} overlayClassName={styles.tooltipOverlay}>
      <InfoCircleOutlined className={styles.infoIcon} aria-label={ariaLabel} />
    </Tooltip>
  );
}

export function AvgCapacityTooltipContent({
  periodLabel,
  isPeriodView = false,
}: {
  periodLabel: string;
  isPeriodView?: boolean;
}) {
  return (
    <div className={styles.tooltipContent}>
      <p className={styles.tooltipTitle}>Cách tính Avg capacity</p>
      <p className={styles.tooltipFormula}>
        {isPeriodView
          ? '(Tổng điểm được giao ÷ Tổng capacity ngày làm việc) × 100'
          : '(Tổng điểm được giao ÷ Tổng capacity/ngày) × 100'}
      </p>
      <ul className={styles.tooltipList}>
        <li>
          <strong>Điểm được giao</strong> - tổng số lượng × điểm task
          {isPeriodView
            ? ` trong khoảng ${periodLabel}`
            : ` của các task trong ngày ${periodLabel}`}
        </li>
        <li>
          <strong>Capacity/ngày</strong> - giới hạn capacity theo job title của từng nhân viên
          {isPeriodView ? ', nhân với số ngày làm việc trong kỳ' : null}
        </li>
        <li>Chỉ tính nhân viên có trạng thái Working trong danh sách hiện tại</li>
        <li>Áp dụng theo bộ lọc Period, Phòng ban và Trạng thái phía trên</li>
      </ul>
    </div>
  );
}

export function EmployeeCapacityTooltipContent({
  periodLabel,
  isPeriodView = false,
}: {
  periodLabel: string;
  isPeriodView?: boolean;
}) {
  return (
    <div className={styles.tooltipContent}>
      <p className={styles.tooltipTitle}>Cách tính Capacity</p>
      <p className={styles.tooltipFormula}>
        {isPeriodView
          ? '(Tổng điểm được giao ÷ Capacity ngày làm việc) × 100'
          : '(Điểm được giao ÷ Capacity/ngày) × 100'}
      </p>
      <ul className={styles.tooltipList}>
        <li>
          <strong>Điểm được giao</strong> - tổng số lượng × điểm task
          {isPeriodView
            ? ` trong khoảng ${periodLabel}`
            : ` của các task được giao trong ngày ${periodLabel}`}
        </li>
        <li>
          <strong>Capacity/ngày</strong> - giới hạn capacity theo job title của nhân viên
          {isPeriodView ? ', nhân với số ngày làm việc trong kỳ' : null}
        </li>
        <li>Hiển thị - nếu nhân viên Off hoặc đang nghỉ phép</li>
      </ul>
    </div>
  );
}

export function CapacityColumnTitle({
  periodLabel,
  isPeriodView = false,
}: {
  periodLabel: string;
  isPeriodView?: boolean;
}) {
  return (
    <span className={styles.columnHeader}>
      Capacity
      <CapacityHelpTooltip
        title={<EmployeeCapacityTooltipContent periodLabel={periodLabel} isPeriodView={isPeriodView} />}
        ariaLabel="Cách tính Capacity"
        placement="top"
      />
    </span>
  );
}
