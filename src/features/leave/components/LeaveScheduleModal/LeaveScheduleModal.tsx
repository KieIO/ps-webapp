import { Alert, Button, DatePicker, Form, Input, Modal, Select, Spin, Steps, Table, Typography } from 'antd';
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
import { useCreateLeave, useLeavePreview } from '../../hooks/useLeave';
import { ReassignToColumnTitle } from '../ReassignToHelpTooltip/ReassignToHelpTooltip';
import type { LeaveAffectedTask, LeaveReplacementCandidate } from '../../schemas/leave.schema';
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

  const { data: preview, isLoading: previewLoading, isFetching: previewFetching } = useLeavePreview(
    open ? userId : null,
    startDate,
    endDate,
  );
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

  const handleClose = () => {
    onClose();
  };

  const handleDatesNext = (values: LeaveDatesFormValues) => {
    const [start, end] = values.dateRange;
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

  const stepIndex = step === 'dates' ? 0 : step === 'tasks' ? 1 : 2;

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
        <StatusPill label={CONFIRMATION_LABELS[status]} variant={status === 'confirmed' ? 'in-progress' : 'pending'} />
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
            const candidate = record.replacementCandidates.find((item) => item.userId === option.value);
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
      width={920}
      destroyOnHidden
      className={styles.modal}
    >
      <Steps
        current={stepIndex}
        size="small"
        className={styles.steps}
        items={[
          { title: 'Leave period' },
          { title: 'Review tasks' },
          { title: 'Confirm' },
        ]}
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
            Set the leave period for {userName}. The employee will be marked as on leave immediately after
            confirmation.
          </Typography.Paragraph>

          <Form.Item
            name="dateRange"
            label="Leave period"
            rules={[{ required: true, message: 'Select leave dates' }]}
          >
            <DatePicker.RangePicker format={DATE_FORMAT} className={styles.dateRange} />
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
              description="This employee has no assigned tasks that overlap the leave period. You can proceed without reassignment."
              className={styles.emptyAlert}
            />
          ) : (
            <>
              <Alert
                type="warning"
                showIcon
                message={`${tasks.length} active task${tasks.length === 1 ? '' : 's'} during leave`}
                description="Review and optionally reassign tasks. Replacements are recommended but not required."
                className={styles.tasksAlert}
              />
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
              description="These tasks will remain assigned to other staff or become unassigned for this employee."
              className={styles.warningAlert}
            />
          ) : null}

          <Alert
            type="info"
            showIcon
            message="Employee will be marked On leave immediately"
            description="When the leave period ends, an admin must manually reactivate the employee to restore task assignment."
          />

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
