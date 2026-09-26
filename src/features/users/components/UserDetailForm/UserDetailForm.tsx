import { Alert, Button, Form, Input, Select, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DATE_FORMAT, ROUTES } from '@/config/constants';
import type { Role } from '@/config/permissions';
import { LeaveScheduleModal } from '@/features/leave/components/LeaveScheduleModal/LeaveScheduleModal';
import { UserLeaveSection } from '@/features/leave/components/UserLeaveSection/UserLeaveSection';
import { RoleAccessPreview } from '@/features/rbac/components/RoleAccessPreview/RoleAccessPreview';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import { JobLevelBadge } from '@/features/capacity/components/JobLevelBadge/JobLevelBadge';
import { useJobLevelList } from '@/features/titles/hooks/useJobLevelList';
import { useJobTitleList } from '@/features/titles/hooks/useJobTitleList';
import { queryClient } from '@/shared/api/queryClient';
import { logout } from '@/store/slices/authSlice';
import {
  DEPARTMENT_LABELS,
  DEPARTMENT_OPTIONS,
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  getEditableStatusOptions,
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

type UserDetailFormValues = Omit<UpdateUserRequest, 'jobTitleId'> & {
  jobTitleId?: string;
  jobLevelId?: string;
};

interface UserDetailFormProps {
  userId: string;
}

export function UserDetailForm({ userId }: UserDetailFormProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
  const { mutate, isPending } = useUpdateUser({ silentSuccess: true });
  const { data: jobTitlesData, isLoading: jobTitlesLoading } = useJobTitleList({});
  const { data: jobLevelsData, isLoading: jobLevelsLoading } = useJobLevelList();
  const selectedRole = Form.useWatch('role', form) as Role | undefined;
  const selectedJobLevelId = Form.useWatch('jobLevelId', form);
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
      jobTitleId: user.jobTitleId ?? undefined,
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

    if (canEditOrg) {
      if (!values.jobLevelId) {
        form.setFields([{ name: 'jobLevelId', errors: ['Select a level'] }]);
        message.error('Select a level before saving.');
        return;
      }
      if (!values.jobTitleId) {
        form.setFields([{ name: 'jobTitleId', errors: ['Select a position code and job title'] }]);
        message.error('Select a position code and job title before saving.');
        return;
      }
      const selectedTitle = jobTitles.find((entry) => entry.id === values.jobTitleId);
      if (!selectedTitle) {
        form.setFields([{ name: 'jobTitleId', errors: ['Select a valid job title'] }]);
        message.error('Select a valid job title before saving.');
        return;
      }
      if (selectedTitle.jobLevelId !== values.jobLevelId) {
        form.setFields([
          {
            name: 'jobTitleId',
            errors: ['Position/job title must match the selected level'],
          },
        ]);
        message.error('Position and job title must match the selected level.');
        return;
      }
    }

    const { jobLevelId: _jobLevelId, ...rest } = values;
    void _jobLevelId;

    const jobTitleId = rest.jobTitleId || user.jobTitleId;
    if (!jobTitleId) {
      message.error('This user needs a job title assigned before saving.');
      return;
    }

    const payload: UpdateUserRequest = {
      name: rest.name,
      email: rest.email,
      role: rest.role,
      status: rest.status,
      department: rest.department,
      jobTitleId,
    };

    const roleChanged = payload.role !== user.role;
    const departmentChanged = payload.department !== user.department;
    const sessionAffected = roleChanged || departmentChanged;

    mutate(
      { id: userId, payload },
      {
        onSuccess: () => {
          if (sessionAffected && actorId === userId) {
            message.success(
              'Profile updated. Sign in again so your new role and department take effect.',
            );
            dispatch(logout());
            queryClient.clear();
            navigate(ROUTES.LOGIN, { replace: true });
            return;
          }

          if (sessionAffected) {
            message.success(
              'User updated. They must sign out and sign in again for the new role/department to apply.',
            );
            return;
          }

          message.success('User updated successfully');
        },
      },
    );
  };

  const handleLevelChange = (levelId: string) => {
    form.setFieldValue('jobLevelId', levelId);
    form.setFields([{ name: 'jobLevelId', errors: [] }]);

    const currentTitleId = form.getFieldValue('jobTitleId');
    if (!currentTitleId) return;

    const currentTitle = jobTitles.find((entry) => entry.id === currentTitleId);
    if (currentTitle && currentTitle.jobLevelId !== levelId) {
      form.setFieldsValue({ jobTitleId: undefined });
      form.setFields([
        {
          name: 'jobTitleId',
          errors: ['Select a position code and job title for this level'],
        },
      ]);
    }
  };

  const handleJobTitleSelection = (titleId: string) => {
    form.setFieldValue('jobTitleId', titleId);
    form.setFields([{ name: 'jobTitleId', errors: [] }]);

    const title = jobTitles.find((entry) => entry.id === titleId);
    if (title) {
      form.setFieldValue('jobLevelId', title.jobLevelId);
      form.setFields([{ name: 'jobLevelId', errors: [] }]);
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

  const previewRole = selectedRole ?? user.role;
  const jobTitleLabel = user.jobTitleName ?? user.jobTitleCode ?? 'Unassigned';
  const levelBadge = mapJobLevelCode(user.jobLevelCode);
  const statusOptions = getEditableStatusOptions(user.status);

  return (
    <div className={canEdit ? styles.layout : styles.layoutReadOnly}>
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
                  <Select options={statusOptions} disabled={!canFullyManage} />
                </Form.Item>
              </div>

              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Department is required' }]}
              >
                <Select options={DEPARTMENT_OPTIONS} disabled={!canEditOrg} />
              </Form.Item>

              <Form.Item
                name="jobLevelId"
                label="Level"
                rules={canEditOrg ? [{ required: true, message: 'Select a level' }] : undefined}
              >
                <Select
                  placeholder="Select level"
                  options={levelOptions}
                  loading={jobLevelsLoading}
                  disabled={!canEditOrg}
                  onChange={handleLevelChange}
                />
              </Form.Item>

              <div className={styles.row}>
                <Form.Item
                  name="jobTitleId"
                  label="Position code"
                  className={styles.field}
                  rules={
                    canEditOrg ? [{ required: true, message: 'Select a position code' }] : undefined
                  }
                >
                  <Select
                    placeholder="Select position code"
                    options={positionCodeOptions}
                    loading={jobTitlesLoading}
                    disabled={!canEditOrg}
                    showSearch
                    optionFilterProp="label"
                    onChange={handleJobTitleSelection}
                  />
                </Form.Item>

                <Form.Item
                  name="jobTitleId"
                  label="Job title"
                  className={styles.field}
                  rules={
                    canEditOrg ? [{ required: true, message: 'Select a job title' }] : undefined
                  }
                >
                  <Select
                    placeholder="Select job title"
                    options={jobTitleOptions}
                    loading={jobTitlesLoading}
                    disabled={!canEditOrg}
                    showSearch
                    optionFilterProp="label"
                    onChange={handleJobTitleSelection}
                  />
                </Form.Item>
              </div>

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

      {canFullyManage ? (
        <div className={styles.previewColumn}>
          <RoleAccessPreview role={previewRole} />
        </div>
      ) : null}

      <LeaveScheduleModal
        open={leaveModalOpen}
        userId={userId}
        userName={user.name}
        onClose={() => setLeaveModalOpen(false)}
      />
    </div>
  );
}
