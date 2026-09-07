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
        title={
          <EmployeeCapacityTooltipContent periodLabel={periodLabel} isPeriodView={isPeriodView} />
        }
        ariaLabel="Cách tính Capacity"
        placement="top"
      />
    </span>
  );
}

function ColumnTitleWithHelp({
  label,
  ariaLabel,
  children,
}: {
  label: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <span className={styles.columnHeader}>
      {label}
      <CapacityHelpTooltip title={children} ariaLabel={ariaLabel} placement="top" />
    </span>
  );
}

function TooltipBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.tooltipContent}>
      <p className={styles.tooltipTitle}>{title}</p>
      {children}
    </div>
  );
}

function DailyCapacityTooltipContent() {
  return (
    <TooltipBlock title="Capacity/ngày">
      <p className={styles.tooltipBody}>Giới hạn điểm làm việc tối đa mỗi ngày theo chức danh.</p>
      <p className={styles.tooltipBody}>Dùng làm mẫu số khi tính % capacity trên trang Capacity.</p>
    </TooltipBlock>
  );
}

function ConversionRatioTooltipContent() {
  return (
    <TooltipBlock title="Tỷ lệ CM/QL">
      <p className={styles.tooltipBody}>
        <strong>CM</strong> — Creative Manager (quản lý sáng tạo)
        <br />
        <strong>QL</strong> — Quản lý (PM, trưởng nhóm…)
      </p>
      <p className={styles.tooltipBody}>
        Phần trăm capacity/ngày dành cho công việc task. Phần còn lại là điều phối, họp, review…
      </p>
      <ul className={styles.tooltipList}>
        <li>
          <strong>Staff</strong> (làm task trực tiếp): thường <strong>100%</strong>
        </li>
        <li>
          <strong>PM / CM</strong>: thường <strong>30–75%</strong>
        </li>
      </ul>
    </TooltipBlock>
  );
}

function SpecialistTaskPointsTooltipContent() {
  return (
    <TooltipBlock title="Điểm task CM">
      <p className={styles.tooltipBody}>
        <strong>CM</strong> — Creative Manager. Cột này cũng áp dụng cho các chức danh quản lý khác.
      </p>
      <p className={styles.tooltipFormula}>Capacity/ngày × Tỷ lệ CM/QL ÷ 100</p>
      <p className={styles.tooltipBody}>
        Tự tính từ cấu hình chức danh (Settings → Employee capacity formula).
      </p>
    </TooltipBlock>
  );
}

export function DailyCapacityColumnTitle() {
  return (
    <ColumnTitleWithHelp label="Capacity/ngày" ariaLabel="Giải thích Capacity/ngày">
      <DailyCapacityTooltipContent />
    </ColumnTitleWithHelp>
  );
}

export function ConversionRatioColumnTitle() {
  return (
    <ColumnTitleWithHelp label="Tỷ lệ CM/QL" ariaLabel="Giải thích Tỷ lệ CM/QL">
      <ConversionRatioTooltipContent />
    </ColumnTitleWithHelp>
  );
}

export function SpecialistTaskPointsColumnTitle() {
  return (
    <ColumnTitleWithHelp label="Điểm task CM" ariaLabel="Giải thích Điểm task CM">
      <SpecialistTaskPointsTooltipContent />
    </ColumnTitleWithHelp>
  );
}
