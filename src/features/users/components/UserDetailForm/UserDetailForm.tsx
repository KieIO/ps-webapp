import { Alert, Button, Form, Input, Select, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DATE_FORMAT, ROUTES } from '@/config/constants';
import { LeaveScheduleModal } from '@/features/leave/components/LeaveScheduleModal/LeaveScheduleModal';
import { UserLeaveSection } from '@/features/leave/components/UserLeaveSection/UserLeaveSection';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import { JobLevelBadge } from '@/features/capacity/components/JobLevelBadge/JobLevelBadge';
import { useJobLevelList } from '@/features/titles/hooks/useJobLevelList';
import { useJobTitleList } from '@/features/titles/hooks/useJobTitleList';
import {
  DEPARTMENT_LABELS,
  DEPARTMENT_OPTIONS,
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from '../../constants';
import { useUpdateUser } from '../../hooks/useUpdateUser';
import { useUser } from '../../hooks/useUser';
import type { UpdateUserRequest } from '../../schemas/user.schema';
import { mapJobLevelCode } from '../../utils/jobLevel';
import {
  canEditUserOrgFields,
  canEditUserProfile,
  canFullyManageUserProfiles,
} from '../../utils/userProfileAccess';
import styles from './UserDetailForm.module.scss';

const STATUS_VARIANT = {
  active: 'completed',
  on_leave: 'on-leave',
  inactive: 'on-leave',
  invited: 'pending',
} as const;

type UserDetailFormValues = UpdateUserRequest & {
  jobLevelId?: string;
};

interface UserDetailFormProps {
  userId: string;
}

export function UserDetailForm({ userId }: UserDetailFormProps) {
  const navigate = useNavigate();
  const { can, role } = usePermission();
  const actorId = useAppSelector((state) => state.auth.user?.id);
  const canManageUsers = can('MANAGE_USERS');
  const canFullyManage = canFullyManageUserProfiles(role);
  const canEdit = canEditUserProfile(role, actorId, userId, canManageUsers);
  const canEditOrg = canEditUserOrgFields(role, canManageUsers);
  const canManageLeave = can('MANAGE_LEAVE');
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [form] = Form.useForm<UserDetailFormValues>();
  const { data: user, isLoading, error } = useUser(userId);
  const { mutate, isPending } = useUpdateUser();
  const { data: jobTitlesData, isLoading: jobTitlesLoading } = useJobTitleList({});
  const { data: jobLevelsData, isLoading: jobLevelsLoading } = useJobLevelList();
  const selectedJobLevelId = Form.useWatch('jobLevelId', form);
  const selectedJobTitleId = Form.useWatch('jobTitleId', form);
  const jobTitles = jobTitlesData?.items ?? [];
  const jobLevels = jobLevelsData?.items ?? [];
  const filteredJobTitles = jobTitles.filter(
    (title) => !selectedJobLevelId || title.jobLevelId === selectedJobLevelId,
  );

  useEffect(() => {
    if (!user) return;

    const title = jobTitles.find((entry) => entry.id === user.jobTitleId);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      jobTitleId: user.jobTitleId,
      jobLevelId: title?.jobLevelId,
    });
  }, [user, form, jobTitles]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Alert
        type="error"
        showIcon
        message="User not found"
        description={error instanceof Error ? error.message : 'Unable to load user details.'}
        action={
          <Button
            type="link"
            onClick={() => (canManageUsers ? navigate(ROUTES.USERS) : navigate(-1))}
          >
            {canManageUsers ? 'Back to users' : 'Back'}
          </Button>
        }
      />
    );
  }

  const handleFinish = (values: UserDetailFormValues) => {
    if (values.status === 'on_leave' && user.status !== 'on_leave') {
      setLeaveModalOpen(true);
      form.setFieldValue('status', user.status);
      return;
    }

    if (values.status === 'active' && user.status === 'on_leave') {
      message.warning(
        'Use the Activate employee button in the Leave section to reactivate this user.',
      );
      form.setFieldValue('status', user.status);
      return;
    }

    const { jobLevelId, ...payload } = values;
    void jobLevelId;
    mutate({ id: userId, payload });
  };

  const handleLevelChange = (levelId: string | undefined) => {
    form.setFieldValue('jobLevelId', levelId);
    const currentTitleId = form.getFieldValue('jobTitleId');
    if (!currentTitleId || !levelId) return;

    const currentTitle = jobTitles.find((entry) => entry.id === currentTitleId);
    if (currentTitle && currentTitle.jobLevelId !== levelId) {
      form.setFieldValue('jobTitleId', null);
    }
  };

  const handleJobTitleSelection = (titleId: string | null) => {
    form.setFieldValue('jobTitleId', titleId);
    if (!titleId) return;

    const title = jobTitles.find((entry) => entry.id === titleId);
    if (title) {
      form.setFieldValue('jobLevelId', title.jobLevelId);
    }
  };

  const levelOptions = jobLevels.map((level) => ({
    value: level.id,
    label: level.label,
  }));

  const positionCodeOptions = filteredJobTitles.map((title) => ({
    value: title.id,
    label: title.code,
  }));

  const jobTitleOptions = filteredJobTitles.map((title) => ({
    value: title.id,
    label: title.name,
  }));

  const jobTitleLabel = user.jobTitleName ?? user.jobTitleCode ?? 'Unassigned';
  const levelBadge = mapJobLevelCode(user.jobLevelCode);

  return (
    <div className={styles.layoutReadOnly}>
      <div className={styles.formColumn}>
        <CardWrapper
          title={user.name}
          subtitle={`Joined ${dayjs(user.joinedAt).format(DATE_FORMAT)}`}
          actions={
            user.updatedAt ? (
              <span className={styles.meta}>
                Last updated {dayjs(user.updatedAt).format(DATE_FORMAT)}
              </span>
            ) : undefined
          }
        >
          <div className={styles.summary}>
            <StatusPill label={STATUS_LABELS[user.status]} variant={STATUS_VARIANT[user.status]} />
            <span className={styles.summaryText}>
              {ROLE_LABELS[user.role]} · {DEPARTMENT_LABELS[user.department]}
              {user.positionCode ? ` · ${user.positionCode}` : ''}
            </span>
          </div>

          {canEdit ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark={false}
              className={styles.form}
            >
              <Form.Item
                name="name"
                label="Full name"
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input />
              </Form.Item>

              <div className={styles.row}>
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: 'Role is required' }]}
                  className={styles.field}
                >
                  <Select options={ROLE_OPTIONS} disabled={!canFullyManage} />
                </Form.Item>

                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Status is required' }]}
                  className={styles.field}
                >
                  <Select options={STATUS_OPTIONS} disabled={!canFullyManage} />
                </Form.Item>
              </div>

              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Department is required' }]}
              >
                <Select options={DEPARTMENT_OPTIONS} disabled={!canEditOrg} />
              </Form.Item>

              <Form.Item name="jobLevelId" label="Level">
                <Select
                  allowClear
                  placeholder="Select level"
                  options={levelOptions}
                  loading={jobLevelsLoading}
                  disabled={!canEditOrg}
                  onChange={handleLevelChange}
                />
              </Form.Item>

              <div className={styles.row}>
                <Form.Item label="Position code" className={styles.field}>
                  <Select
                    allowClear
                    placeholder="Select position code"
                    value={selectedJobTitleId ?? undefined}
                    options={positionCodeOptions}
                    loading={jobTitlesLoading}
                    disabled={!canEditOrg}
                    showSearch
                    optionFilterProp="label"
                    onChange={handleJobTitleSelection}
                  />
                </Form.Item>

                <Form.Item label="Job title" className={styles.field}>
                  <Select
                    allowClear
                    placeholder="Select job title"
                    value={selectedJobTitleId ?? undefined}
                    options={jobTitleOptions}
                    loading={jobTitlesLoading}
                    disabled={!canEditOrg}
                    showSearch
                    optionFilterProp="label"
                    onChange={handleJobTitleSelection}
                  />
                </Form.Item>
              </div>

              <Form.Item name="jobTitleId" hidden>
                <Input />
              </Form.Item>

              <div className={styles.actions}>
                <Button onClick={() => (canManageUsers ? navigate(ROUTES.USERS) : navigate(-1))}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  Save changes
                </Button>
              </div>
            </Form>
          ) : (
            <dl className={styles.readOnlyFields}>
              <div className={styles.readOnlyRow}>
                <dt>Full name</dt>
                <dd>{user.name}</dd>
              </div>
              <div className={styles.readOnlyRow}>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div className={styles.readOnlyRow}>
                <dt>Role</dt>
                <dd>{ROLE_LABELS[user.role]}</dd>
              </div>
              <div className={styles.readOnlyRow}>
                <dt>Status</dt>
                <dd>{STATUS_LABELS[user.status]}</dd>
              </div>
              <div className={styles.readOnlyRow}>
                <dt>Department</dt>
                <dd>{DEPARTMENT_LABELS[user.department]}</dd>
              </div>
              <div className={styles.readOnlyRow}>
                <dt>Level</dt>
                <dd>{levelBadge ? <JobLevelBadge level={levelBadge} /> : '—'}</dd>
              </div>
              <div className={styles.readOnlyRow}>
                <dt>Position code</dt>
                <dd>{user.positionCode ?? '—'}</dd>
              </div>
              <div className={styles.readOnlyRow}>
                <dt>Job title</dt>
                <dd>{jobTitleLabel}</dd>
              </div>
            </dl>
          )}
        </CardWrapper>

        {(canManageLeave || can('REACTIVATE_USER') || canEdit) && (
          <UserLeaveSection
            userId={userId}
            userStatus={user.status}
            onScheduleLeave={() => setLeaveModalOpen(true)}
          />
        )}
      </div>

      <LeaveScheduleModal
        open={leaveModalOpen}
        userId={userId}
        userName={user.name}
        onClose={() => setLeaveModalOpen(false)}
      />
    </div>
  );
}
