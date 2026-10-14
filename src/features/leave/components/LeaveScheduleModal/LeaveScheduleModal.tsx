import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Steps,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath, DATE_FORMAT } from '@/config/constants';
import { JobLevelBadge } from '@/features/capacity/components/JobLevelBadge/JobLevelBadge';
import { DEPARTMENT_LABELS, type UserDepartment } from '@/features/users/constants';
import { CONFIRMATION_LABELS } from '@/shared/constants/taskConfirmation';
import type { TaskConfirmationStatus } from '@/shared/constants/taskConfirmation';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import { useCreateLeave, useLeavePreview, useOpenLeaves } from '../../hooks/useLeave';
import type { LeaveAffectedTask, LeaveReplacementCandidate } from '../../schemas/leave.schema';
import {
  isDayBookedByOpenLeaves,
  leaveStatusLabel,
  rangeOverlapsOpenLeaves,
  resolveLeaveStatusOnCreate,
} from '../../utils/leaveStatus';
import { ReassignToColumnTitle } from '../ReassignToHelpTooltip/ReassignToHelpTooltip';
import styles from './LeaveScheduleModal.module.scss';

interface LeaveScheduleModalProps {
  open: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type StepKey = 'dates' | 'tasks' | 'confirm';

type LeaveDatesFormValues = {
  dateRange: [Dayjs, Dayjs];
  reason?: string;
};

const MODAL_WIDTH: Record<StepKey, number> = {
  dates: 560,
  tasks: 920,
  confirm: 560,
};

export function LeaveScheduleModal({
  open,
  userId,
  userName,
  onClose,
  onSuccess,
}: LeaveScheduleModalProps) {
  const [step, setStep] = useState<StepKey>('dates');
  const [datesForm] = Form.useForm<LeaveDatesFormValues>();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [replacements, setReplacements] = useState<Record<string, string | null>>({});

  const {
    data: preview,
    isLoading: previewLoading,
    isFetching: previewFetching,
  } = useLeavePreview(open ? userId : null, startDate, endDate);
  const { data: openLeaves = [], isLoading: openLeavesLoading } = useOpenLeaves(userId);
  const { mutate: createLeave, isPending } = useCreateLeave();

  useEffect(() => {
    if (!open) {
      setStep('dates');
      setStartDate(null);
      setEndDate(null);
      setReason('');
      setReplacements({});
      datesForm.resetFields();
    }
  }, [open, datesForm]);

  const tasks = preview?.tasks ?? [];
  const unassignedCount = useMemo(
    () => tasks.filter((task) => !replacements[task.id]).length,
    [tasks, replacements],
  );

  const bookedLeaves = useMemo(
    () => openLeaves.filter((leave) => leave.status === 'scheduled' || leave.status === 'active'),
    [openLeaves],
  );

  const disableBookedDate = (current: Dayjs) =>
    Boolean(current && isDayBookedByOpenLeaves(current, bookedLeaves));

  const handleClose = () => {
    onClose();
  };

  const handleDatesNext = (values: LeaveDatesFormValues) => {
    const [start, end] = values.dateRange;
    if (rangeOverlapsOpenLeaves(start, end, bookedLeaves)) {
      datesForm.setFields([
        {
          name: 'dateRange',
          errors: ['Selected dates overlap an existing leave period'],
        },
      ]);
      return;
    }
    setStartDate(start.format('YYYY-MM-DD'));
    setEndDate(end.format('YYYY-MM-DD'));
    setReason(values.reason?.trim() ?? '');
    setReplacements({});
    setStep('tasks');
  };

  const handleConfirm = () => {
    if (!startDate || !endDate) return;

    createLeave(
      {
        userId,
        payload: {
          startDate,
          endDate,
          reason,
          reassignments: tasks.map((task) => ({
            taskId: task.id,
            replacementUserId: replacements[task.id] ?? null,
          })),
        },
      },
      {
        onSuccess: () => {
          onSuccess?.();
          handleClose();
        },
      },
    );
  };

  const pendingStatus =
    startDate && endDate ? resolveLeaveStatusOnCreate(startDate, endDate) : null;

  const stepIndex = step === 'dates' ? 0 : step === 'tasks' ? 1 : 2;

  const outcomeNote =
    pendingStatus === 'ended'
      ? 'This period has already ended, so it is saved as history and the employee stays Active.'
      : pendingStatus === 'scheduled'
        ? 'Leave is scheduled. The employee stays Active until the start date, then goes On leave for this period. After it ends, an admin must Activate.'
        : 'This period covers today, so the employee will be marked On leave. After it ends, an admin must Activate to restore task assignment.';

  const taskColumns: ColumnsType<LeaveAffectedTask> = [
    {
      title: 'Task',
      key: 'task',
      render: (_, record) => (
        <Link
          to={buildMyTaskDetailPath(record.id)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.taskLink}
        >
          <div className={styles.taskCell}>
            <span className={styles.taskCode}>{record.taskCode}</span>
            <span className={styles.taskName}>{record.taskName}</span>
            <span className={styles.projectName}>{record.projectName}</span>
          </div>
        </Link>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      width: 110,
      render: (date: string) => dayjs(date).format(DATE_FORMAT),
    },
    {
      title: 'Status',
      dataIndex: 'staffConfirmation',
      width: 130,
      render: (status: TaskConfirmationStatus) => (
        <StatusPill
          label={CONFIRMATION_LABELS[status]}
          variant={status === 'confirmed' ? 'in-progress' : 'pending'}
        />
      ),
    },
    {
      title: <ReassignToColumnTitle />,
      key: 'replacement',
      width: 260,
      render: (_, record) => (
        <Select
          allowClear
          placeholder="Select replacement (optional)"
          className={styles.replacementSelect}
          popupMatchSelectWidth={false}
          dropdownStyle={{ minWidth: 300 }}
          value={replacements[record.id] ?? undefined}
          onChange={(value) =>
            setReplacements((current) => ({
              ...current,
              [record.id]: value ?? null,
            }))
          }
          options={record.replacementCandidates.map((candidate) => ({
            value: candidate.userId,
            label: candidate.name,
          }))}
          labelRender={({ value }) => {
            const candidate = record.replacementCandidates.find((item) => item.userId === value);
            if (!candidate) return null;
            if (candidate.capacityPercent !== null) {
              return `${candidate.name} (${candidate.capacityPercent}%)`;
            }
            return candidate.name;
          }}
          optionRender={(option) => {
            const candidate = record.replacementCandidates.find(
              (item) => item.userId === option.value,
            );
            if (!candidate) return option.label;
            return <ReplacementOption candidate={candidate} />;
          }}
        />
      ),
    },
  ];

  return (
    <Modal
      title={`Schedule leave — ${userName}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={MODAL_WIDTH[step]}
      destroyOnHidden
      className={styles.modal}
    >
      <Steps
        current={stepIndex}
        size="small"
        className={styles.steps}
        items={[{ title: 'Leave period' }, { title: 'Review tasks' }, { title: 'Confirm' }]}
      />

      {step === 'dates' && (
        <Form
          form={datesForm}
          layout="vertical"
          onFinish={handleDatesNext}
          requiredMark={false}
          className={styles.form}
        >
          <Typography.Paragraph type="secondary" className={styles.intro}>
            Choose one period for {userName}. Booked dates are disabled below.
          </Typography.Paragraph>

          {openLeavesLoading ? (
            <div className={styles.bookedLoading}>
              <Spin size="small" />
            </div>
          ) : bookedLeaves.length > 0 ? (
            <div className={styles.bookedBlock}>
              <h4 className={styles.bookedTitle}>Already booked</h4>
              <ul className={styles.bookedList}>
                {bookedLeaves.map((leave) => (
                  <li key={leave.id} className={styles.bookedItem}>
                    <StatusPill
                      label={leaveStatusLabel(leave.status)}
                      variant={leave.status === 'active' ? 'on-leave' : 'pending'}
                    />
                    <span>
                      {dayjs(leave.startDate).format(DATE_FORMAT)} →{' '}
                      {dayjs(leave.endDate).format(DATE_FORMAT)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Form.Item
            name="dateRange"
            label="Leave period"
            rules={[
              { required: true, message: 'Select leave dates' },
              {
                validator: async (_, value: [Dayjs, Dayjs] | undefined) => {
                  if (!value?.[0] || !value?.[1]) return;
                  if (rangeOverlapsOpenLeaves(value[0], value[1], bookedLeaves)) {
                    throw new Error('Selected dates overlap an existing leave period');
                  }
                },
              },
            ]}
          >
            <DatePicker.RangePicker
              format={DATE_FORMAT}
              className={styles.dateRange}
              disabledDate={disableBookedDate}
            />
          </Form.Item>

          <Form.Item name="reason" label="Reason (optional)">
            <Input.TextArea rows={3} placeholder="e.g. Annual leave, personal matters" />
          </Form.Item>

          <div className={styles.footer}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </div>
        </Form>
      )}

      {step === 'tasks' && (
        <div className={styles.tasksStep}>
          <Typography.Paragraph type="secondary" className={styles.intro}>
            {startDate && endDate
              ? `${dayjs(startDate).format(DATE_FORMAT)} → ${dayjs(endDate).format(DATE_FORMAT)}`
              : null}
          </Typography.Paragraph>

          {previewLoading || previewFetching ? (
            <div className={styles.loading}>
              <Spin />
            </div>
          ) : tasks.length === 0 ? (
            <Alert
              type="success"
              showIcon
              message="No active tasks during this period"
              description="You can proceed without reassignment."
              className={styles.emptyAlert}
            />
          ) : (
            <>
              <Typography.Paragraph type="secondary" className={styles.tasksHint}>
                {tasks.length} active task{tasks.length === 1 ? '' : 's'} in this period. Reassign
                replacements if needed (optional).
              </Typography.Paragraph>
              <Table
                rowKey="id"
                columns={taskColumns}
                dataSource={tasks}
                pagination={false}
                size="small"
                scroll={{ x: 760 }}
              />
            </>
          )}

          <div className={styles.footer}>
            <Button onClick={() => setStep('dates')}>Back</Button>
            <Button type="primary" onClick={() => setStep('confirm')}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className={styles.confirmStep}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Employee</span>
              <span>{userName}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Leave period</span>
              <span>
                {startDate && endDate
                  ? `${dayjs(startDate).format(DATE_FORMAT)} → ${dayjs(endDate).format(DATE_FORMAT)}`
                  : '—'}
              </span>
            </div>
            {reason ? (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Reason</span>
                <span>{reason}</span>
              </div>
            ) : null}
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Tasks reassigned</span>
              <span>
                {tasks.length - unassignedCount} of {tasks.length}
              </span>
            </div>
          </div>

          {unassignedCount > 0 && tasks.length > 0 ? (
            <Alert
              type="warning"
              showIcon
              message={`${unassignedCount} task${unassignedCount === 1 ? '' : 's'} without replacement`}
              description="These tasks stay with other staff or become unassigned for this employee."
              className={styles.warningAlert}
            />
          ) : null}

          <Typography.Paragraph type="secondary" className={styles.outcomeNote}>
            {outcomeNote}
          </Typography.Paragraph>

          <div className={styles.footer}>
            <Button onClick={() => setStep('tasks')}>Back</Button>
            <Button type="primary" loading={isPending} onClick={handleConfirm}>
              Confirm leave
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ReplacementOption({ candidate }: { candidate: LeaveReplacementCandidate }) {
  const percent = candidate.capacityPercent;
  const isHigh = percent !== null && percent > 100;
  const dept = DEPARTMENT_LABELS[candidate.department as UserDepartment] ?? candidate.department;

  return (
    <div className={styles.candidateOption}>
      <div className={styles.candidatePrimary}>
        <span className={styles.candidateName}>{candidate.name}</span>
        <span className={isHigh ? styles.capacityHigh : styles.capacityNormal}>
          {percent !== null ? `${percent}%` : '—'}
        </span>
      </div>
      <div className={styles.candidateMeta}>
        <span className={styles.candidateDept}>{dept}</span>
        <JobLevelBadge level={candidate.jobLevel} />
      </div>
    </div>
  );
}
