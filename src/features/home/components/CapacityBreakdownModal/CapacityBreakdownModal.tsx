import { useEffect, useState } from 'react';
import { Alert, Button, Collapse, Modal, Pagination, Skeleton } from 'antd';
import { useCapacityBreakdown } from '../../hooks/useCapacityBreakdown';
import { useCapacityBreakdownStaffTasks } from '../../hooks/useCapacityBreakdownStaffTasks';
import type {
  CapacityBreakdownScope,
  CapacityBreakdownStaffItem,
} from '../../schemas/capacityBreakdown.schema';
import styles from './CapacityBreakdownModal.module.scss';

interface CapacityBreakdownModalProps {
  open: boolean;
  scope: CapacityBreakdownScope | null;
  period: { year: number; month: number };
  onClose: () => void;
}

const scopeLabels: Record<CapacityBreakdownScope, string> = {
  company: 'toàn công ty',
  project: 'phòng Project',
  creative: 'phòng Creative',
};

const formatPoints = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 2,
});

const formatPercent = (value: number) =>
  `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;

function staffCapacityPercent(workloadPoints: number, monthlyCapacityPoints: number) {
  if (monthlyCapacityPoints <= 0) return null;
  return (workloadPoints / monthlyCapacityPoints) * 100;
}

function StaffTasksContent({
  staff,
  period,
  workingDays,
  active,
}: {
  staff: CapacityBreakdownStaffItem;
  period: { year: number; month: number };
  workingDays: number;
  active: boolean;
}) {
  const { data, isLoading, isError, refetch, isFetching } = useCapacityBreakdownStaffTasks(
    period,
    staff.userId,
    { enabled: active },
  );

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 3 }} title={false} />;
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Không tải được task"
        action={
          <Button size="small" onClick={() => void refetch()} loading={isFetching}>
            Thử lại
          </Button>
        }
      />
    );
  }

  const workload = data?.workloadPoints ?? staff.workloadPoints;
  const daily = data?.dailyCapacityPoints ?? staff.dailyCapacityPoints;
  const monthly = data?.monthlyCapacityPoints ?? staff.monthlyCapacityPoints;
  const days = data?.workingDays ?? workingDays;
  const tasks = data?.tasks ?? [];
  const percent = staffCapacityPercent(workload, monthly);

  return (
    <div className={styles.staffDetail}>
      <div className={styles.capacityBlock}>
        <p className={styles.capacityLine}>
          {formatPoints.format(workload)} ÷ {formatPoints.format(monthly)} × 100 ={' '}
          <strong>{percent == null ? '—' : formatPercent(percent)}</strong>
        </p>
        <p className={styles.capacityHint}>
          Năng lực tháng = {formatPoints.format(daily)} × {days} ngày
        </p>
      </div>
      <p className={styles.taskSectionTitle}>Task tạo workload</p>
      {tasks.length === 0 ? (
        <p className={styles.emptyTasks}>Không có task trong kỳ.</p>
      ) : (
        <div className={styles.taskList}>
          {tasks.map((task) => (
            <div className={styles.taskRow} key={`${task.taskName}-${task.level}-${task.score}`}>
              <span>
                {task.taskName} · Level {task.level}
              </span>
              <span>
                {formatPoints.format(task.quantity)} × {task.score} ={' '}
                <strong>{formatPoints.format(task.points)} điểm</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CapacityBreakdownModal({
  open,
  scope,
  period,
  onClose,
}: CapacityBreakdownModalProps) {
  const [page, setPage] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { data, isLoading, isError, refetch, isFetching } = useCapacityBreakdown(
    period,
    scope,
    page,
    { enabled: open && scope != null },
  );

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setExpandedKeys([]);
  }, [open, scope, period.year, period.month]);

  const handleClose = () => {
    setPage(1);
    setExpandedKeys([]);
    onClose();
  };

  const percent =
    data && data.availableCapacityPoints > 0
      ? (data.workloadPoints / data.availableCapacityPoints) * 100
      : null;

  return (
    <Modal
      title={`Breakdown Capacity ${scope ? scopeLabels[scope] : ''}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={760}
      destroyOnHidden
    >
      {isLoading && <Skeleton active paragraph={{ rows: 8 }} />}

      {isError && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải breakdown"
          action={
            <Button size="small" onClick={() => void refetch()} loading={isFetching}>
              Thử lại
            </Button>
          }
        />
      )}

      {!isLoading && !isError && data && !data.available && (
        <Alert type="info" showIcon message="Breakdown chỉ khả dụng cho tháng hiện tại." />
      )}

      {!isLoading && !isError && data?.available && (
        <>
          <div className={styles.formula}>
            <div>
              <span>1. Workload</span>
              <strong>{formatPoints.format(data.workloadPoints)} điểm</strong>
              <small>Tổng điểm task thực tế trong tháng</small>
            </div>
            <div>
              <span>2. Năng lực/ngày</span>
              <strong>{formatPoints.format(data.dailyCapacityPoints)} điểm</strong>
              <small>Tổng capacity/ngày theo job title</small>
            </div>
            <div>
              <span>3. Năng lực tháng</span>
              <strong>{formatPoints.format(data.availableCapacityPoints)} điểm</strong>
              <small>Bước 2 × {data.workingDays} ngày Thứ 2–6</small>
            </div>
          </div>

          <p className={styles.finalFormula}>
            Capacity = bước 1 ÷ bước 3 × 100 ={' '}
            <strong>
              {formatPoints.format(data.workloadPoints)} ÷{' '}
              {formatPoints.format(data.availableCapacityPoints)} × 100 ={' '}
              {percent == null ? 'Chưa tính được' : formatPercent(percent)}
            </strong>
          </p>

          <h3 className={styles.sectionTitle}>
            Chi tiết theo nhân sự
            <small>
              {data.staff.total} người
              {data.staff.total > data.staff.pageSize
                ? ` · trang ${data.staff.page}/${Math.ceil(data.staff.total / data.staff.pageSize)}`
                : null}
            </small>
          </h3>

          {data.staff.items.length === 0 ? (
            <p className={styles.emptyStaff}>Không có nhân sự trong phạm vi này.</p>
          ) : (
            <Collapse
              className={styles.staffList}
              activeKey={expandedKeys}
              onChange={(keys) => {
                const next = Array.isArray(keys) ? keys.map(String) : [String(keys)];
                setExpandedKeys(next);
              }}
              items={data.staff.items.map((person) => {
                const personPercent = staffCapacityPercent(
                  person.workloadPoints,
                  person.monthlyCapacityPoints,
                );
                return {
                  key: person.userId,
                  label: (
                    <div className={styles.staffLabel}>
                      <span>
                        <strong>{person.name}</strong>
                        <small>
                          {person.jobTitleName} · {person.department}
                        </small>
                      </span>
                      <span className={styles.staffTotals}>
                        <strong>
                          {personPercent == null ? '—' : formatPercent(personPercent)}
                        </strong>
                        <small>
                          {formatPoints.format(person.workloadPoints)} /{' '}
                          {formatPoints.format(person.monthlyCapacityPoints)} điểm
                        </small>
                      </span>
                    </div>
                  ),
                  children: (
                    <StaffTasksContent
                      staff={person}
                      period={period}
                      workingDays={data.workingDays}
                      active={expandedKeys.includes(person.userId)}
                    />
                  ),
                };
              })}
            />
          )}

          {data.staff.total > data.staff.pageSize && (
            <div className={styles.pagination}>
              <Pagination
                current={data.staff.page}
                pageSize={data.staff.pageSize}
                total={data.staff.total}
                showSizeChanger={false}
                onChange={(nextPage) => {
                  setExpandedKeys([]);
                  setPage(nextPage);
                }}
              />
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
