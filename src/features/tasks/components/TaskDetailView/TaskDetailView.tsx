import { useCallback, useState } from 'react';
import { Alert, Badge, Button, Result, Tabs } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildMyTaskDetailPath, DATE_FORMAT, ROUTES } from '@/config/constants';
import { isApiForbiddenError } from '@/shared/api/apiError';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import { useOvertimeDetail } from '@/features/overtime/hooks/useOvertime';
import { TaskDetailHistoryPanel } from '../TaskDetailHistoryPanel/TaskDetailHistoryPanel';
import { TaskDetailSplitChildren } from '../TaskDetailSplitChildren/TaskDetailSplitChildren';
import { TaskDetailSummaryCard } from '../TaskDetailSummaryCard/TaskDetailSummaryCard';
import { TaskRevisionHistoryTab } from '../TaskRevisionHistoryTab/TaskRevisionHistoryTab';
import { useMyTask } from '../../hooks/useMyTask';
import { formatHasRevisionChildrenLabel, hasRevisionChildren } from '../../utils/taskRevision';
import styles from './TaskDetailView.module.scss';

interface TaskDetailViewProps {
  taskId: string;
}

type DetailTabKey = 'details' | 'revision' | 'evaluation';

const isDetailTabKey = (value: string | null): value is DetailTabKey =>
  value === 'details' || value === 'revision' || value === 'evaluation';

const resolveFromTaskId = (raw: string | null, currentTaskId: string): string | null => {
  const from = raw?.trim();
  if (!from || from === currentTaskId) return null;
  return from;
};

export function TaskDetailView({ taskId }: TaskDetailViewProps) {
  const navigate = useNavigate();
  const { data: task, isLoading, isError, error } = useMyTask(taskId);
  const otQuery = useOvertimeDetail(
    task?.overtimeRequestId ?? null,
    Boolean(task?.overtimeRequestId),
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const fromTaskId = resolveFromTaskId(searchParams.get('from'), taskId);
  const [activeTab, setActiveTab] = useState<DetailTabKey>(
    isDetailTabKey(tabFromUrl) ? tabFromUrl : 'details',
  );

  const openRevisionTab = useCallback(() => {
    setActiveTab('revision');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'revision');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const handleTabChange = (key: string) => {
    const nextTab = isDetailTabKey(key) ? key : 'details';
    setActiveTab(nextTab);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextTab === 'details') {
          next.delete('tab');
        } else {
          next.set('tab', nextTab);
        }
        return next;
      },
      { replace: true },
    );
  };

  if (isLoading) {
    return <GlobalLoadingSpinner />;
  }

  if (isError || !task) {
    const forbidden = isApiForbiddenError(error);
    return (
      <Result
        status={forbidden ? 403 : 'error'}
        title={forbidden ? 'Không có quyền xem task' : 'Không tải được task'}
        subTitle={
          forbidden
            ? 'Bạn không có quyền truy cập task này. Task cha đã chia nhỏ chỉ dành cho CM / quản lý.'
            : 'Task có thể đã bị xóa hoặc bạn không có quyền truy cập.'
        }
        extra={
          fromTaskId ? (
            <Button type="primary" onClick={() => navigate(buildMyTaskDetailPath(fromTaskId))}>
              Quay về task chi tiết
            </Button>
          ) : (
            <Button type="primary" onClick={() => navigate(ROUTES.PROJECT_TASKS)}>
              Về danh sách Project Tasks
            </Button>
          )
        }
      />
    );
  }

  const ot = otQuery.data;
  const revisionCount = task.revisionChildCount ?? 0;
  const showParentRevisionCue = hasRevisionChildren(task);

  return (
    <>
      <div className={styles.summary}>
        <TaskDetailSummaryCard task={task} onOpenRevisionTab={openRevisionTab} />
      </div>

      {task.overtimeRequestId ? (
        <Alert
          className={styles.otBanner}
          type="warning"
          showIcon
          message="Task gắn với OT request"
          description={
            ot
              ? `Ngày OT ${dayjs(ot.otDate).format(DATE_FORMAT)} · ${ot.startTime}–${ot.endTime} · ước tính ${ot.estimatedHours}h${
                  ot.actualHours != null ? ` · thực tế ${ot.actualHours}h` : ''
                }`
              : task.description || 'Task được tạo từ OT assign-task.'
          }
        />
      ) : null}

      <div className={styles.body}>
        <div className={styles.main}>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={[
              {
                key: 'details',
                label: 'Details & description',
                children: (
                  <>
                    <p className={styles.sectionTitle}>Task description</p>
                    <p className={styles.description}>{task.description}</p>

                    {task.pmNote ? (
                      <Alert
                        className={styles.noteAlert}
                        type="warning"
                        showIcon
                        message="Note from PM"
                        description={task.pmNote}
                      />
                    ) : null}

                    {task.additionalFactors ? (
                      <>
                        <p className={styles.sectionTitle}>Additional factors</p>
                        <p className={styles.description}>{task.additionalFactors}</p>
                      </>
                    ) : null}

                    <p className={styles.sectionTitle}>Attachments</p>
                    <div className={styles.emptyBlock}>No attachments for this task.</div>

                    <TaskDetailSplitChildren task={task} />
                  </>
                ),
              },
              {
                key: 'revision',
                label: showParentRevisionCue ? (
                  <span className={styles.tabLabelWithBadge}>
                    Revision
                    <Badge
                      count={revisionCount}
                      overflowCount={99}
                      color="cyan"
                      title={formatHasRevisionChildrenLabel(revisionCount)}
                    />
                  </span>
                ) : (
                  'Revision'
                ),
                children: <TaskRevisionHistoryTab task={task} />,
              },
              {
                key: 'evaluation',
                label: 'Evaluation',
                children:
                  task.pmEvaluation || task.completionPercent != null ? (
                    <div className={styles.evalGrid}>
                      <div className={styles.evalItem}>
                        <span className={styles.evalLabel}>Completion</span>
                        <span className={styles.evalValue}>
                          {task.completionPercent != null ? `${task.completionPercent}%` : '—'}
                        </span>
                      </div>
                      <div className={styles.evalItem}>
                        <span className={styles.evalLabel}>Evaluation</span>
                        <span className={styles.evalValue}>{task.pmEvaluation || '—'}</span>
                      </div>
                      <div className={styles.evalItem}>
                        <span className={styles.evalLabel}>PM note</span>
                        <span className={styles.evalValue}>{task.pmNote || '—'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyBlock}>No evaluation recorded yet.</div>
                  ),
              },
            ]}
          />
        </div>

        <div className={styles.side}>
          <TaskDetailHistoryPanel task={task} />
        </div>
      </div>
    </>
  );
}
