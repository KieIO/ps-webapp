import { Alert, Button, Modal, Segmented, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildMyTaskDetailPath, ROUTES } from '@/config/constants';
import { ROLES } from '@/config/permissions';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import { useRehandCreativeToCH } from '../../hooks/useRehandCreativeToCH';
import type { MyTask } from '../../schemas/task.schema';
import {
  canEditCreativePipelineTask,
  canProcessChQueue,
  canProcessCmQueue,
  canRehandCreativeToCH,
  countActionableQueueItems,
  CREATIVE_CM_QUEUE_FRAME_LABELS,
  defaultCreativeQueueView,
  filterCreativeQueue,
  inferParentTaskCodeFromSplit,
  isAwaitingCh,
  isAwaitingCm,
  isReturnedToPm,
  isSplitChildTask,
  needsChBrief,
  PIPELINE_STAGE_LABELS,
  pipelineAssigneeLabel,
  queueActionLabel,
  resolveEffectivePipelineStage,
  SPLIT_CHILD_BADGE_HINT,
  SPLIT_CHILD_BADGE_LABEL,
  type CreativeCmQueueFrame,
  type CreativeQueueView,
} from '../../utils/creativePipeline';
import {
  applyCreativeQueueFilters,
  EMPTY_CREATIVE_QUEUE_FILTERS,
  resolveCreativeQueueFilterVisibility,
  sanitizeCreativeQueueFilters,
  type CreativeQueueListFilters,
} from '../../utils/creativeQueueFilters';
import { getTaskDeadline } from '../../utils/taskDetail';
import { resolveTaskUrgencyDisplay } from '../../utils/taskUrgency';
import { CreativeEditDrawer } from './CreativeEditDrawer';
import { CreativeHeadAssignDrawer } from './CreativeHeadAssignDrawer';
import { CreativeManagerAssignDrawer } from './CreativeManagerAssignDrawer';
import { CreativeQueueFilters } from './CreativeQueueFilters';
import styles from './creativePipeline.module.scss';

dayjs.extend(utc);

const QUEUE_DATETIME = 'DD/MM HH:mm';

const formatQueueDeadline = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  return dayjs.utc(iso).format(QUEUE_DATETIME);
};

export function CreativePipelineView() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;
  const [view, setView] = useState<CreativeQueueView>(defaultCreativeQueueView(role));
  const [cmFrame, setCmFrame] = useState<CreativeCmQueueFrame>('intake');
  const [selected, setSelected] = useState<MyTask | null>(null);
  const [listFilters, setListFilters] = useState<CreativeQueueListFilters>(() => ({
    ...EMPTY_CREATIVE_QUEUE_FILTERS,
  }));

  useEffect(() => {
    setView(defaultCreativeQueueView(role));
  }, [role]);

  useEffect(() => {
    if (view !== 'cm') setCmFrame('intake');
  }, [view]);

  useEffect(() => {
    setListFilters((current) =>
      sanitizeCreativeQueueFilters(
        current,
        resolveCreativeQueueFilterVisibility(view, cmFrame, current),
      ),
    );
  }, [view, cmFrame]);

  const { data, isLoading } = useMyTaskList({ taskCategory: 'project' });
  const tasks = useMemo(() => data?.items ?? [], [data?.items]);
  const rehandCreative = useRehandCreativeToCH();

  const scopedQueue = useMemo(
    () => filterCreativeQueue(tasks, view, user?.id, role, cmFrame),
    [tasks, view, user?.id, role, cmFrame],
  );
  const filterVisibility = useMemo(
    () => resolveCreativeQueueFilterVisibility(view, cmFrame, listFilters),
    [view, cmFrame, listFilters],
  );
  const queue = useMemo(
    () => applyCreativeQueueFilters(scopedQueue, listFilters, filterVisibility),
    [scopedQueue, listFilters, filterVisibility],
  );
  const projectOptions = useMemo(() => {
    const names = new Set<string>();
    for (const task of scopedQueue) {
      if (task.projectName?.trim()) names.add(task.projectName);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [scopedQueue]);
  const actionableCount = useMemo(
    () => countActionableQueueItems(tasks, view, user?.id, role, cmFrame),
    [tasks, view, user?.id, role, cmFrame],
  );

  const showViewToggle = role === ROLES.ADMIN || role === ROLES.PM;
  const chEnabled = canProcessChQueue(role);
  const cmEnabled = canProcessCmQueue(role);

  const confirmRehandToCH = (task: MyTask) => {
    Modal.confirm({
      title: 'Đưa lại hàng chờ CH?',
      content: 'Task sẽ vào lại hàng chờ để các Creative Head nhận và giao CM.',
      okText: 'Đưa lại CH',
      cancelText: 'Quay lại',
      centered: true,
      onOk: () => rehandCreative.mutateAsync(task.id),
    });
  };

  const openTask = (task: MyTask) => {
    if (view === 'ch' && isReturnedToPm(task) && canRehandCreativeToCH(role)) {
      confirmRehandToCH(task);
      return;
    }
    if (view === 'ch' && isAwaitingCh(task) && !canProcessChQueue(role)) {
      navigate(buildMyTaskDetailPath(task.id), {
        state: { backTo: ROUTES.CREATIVE_REVIEW, backLabel: 'Back to Creative queue' },
      });
      return;
    }
    setSelected(task);
  };
  const closeDrawer = () => setSelected(null);

  const openHeadAssign = Boolean(selected && chEnabled && view === 'ch' && isAwaitingCh(selected));
  const openManagerAssign = Boolean(
    selected && view === 'cm' && cmFrame === 'intake' && isAwaitingCm(selected),
  );
  const openEdit = Boolean(
    selected &&
      !openHeadAssign &&
      !openManagerAssign &&
      !isReturnedToPm(selected) &&
      (canEditCreativePipelineTask(selected, role, user?.id) ||
        resolveEffectivePipelineStage(selected) !== 'awaiting_ch'),
  );

  const title = view === 'cm' ? 'Hàng chờ Creative Manager' : 'Hàng chờ Creative Head';
  const subtitle =
    view === 'cm'
      ? cmFrame === 'intake'
        ? 'Task nhận từ Creative Head / PM — giao nguyên hoặc chia nhỏ cho Staff.'
        : 'Task đã giao Staff (nguyên hoặc task nhỏ) — quản lý và đánh giá nhân viên.'
      : 'Nhận task từ PM, bổ sung brief nếu cần, rồi giao cho Creative Manager.';

  const columns: ColumnsType<MyTask> = useMemo(
    () => [
      {
        title: 'Task',
        key: 'identity',
        width: 200,
        render: (_, record) => {
          // Parent “Đã chia nhỏ” already appears in Stage column — only badge children here.
          const splitChild = isSplitChildTask(record);
          const parentCode = splitChild ? inferParentTaskCodeFromSplit(record.taskCode) : null;
          return (
            <div className={styles.identityCell}>
              <Tooltip title={record.taskName}>
                <Link
                  to={buildMyTaskDetailPath(record.id)}
                  state={{ backTo: ROUTES.CREATIVE_REVIEW, backLabel: 'Back to Creative queue' }}
                  className={styles.identityLink}
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className={styles.identityCode}>{record.taskCode}</span>
                  <span className={styles.identityName}>{record.taskName}</span>
                </Link>
              </Tooltip>
              {splitChild ? (
                <span className={styles.identityBadges}>
                  <Tooltip
                    title={
                      parentCode
                        ? `${SPLIT_CHILD_BADGE_HINT} · Task cha: ${parentCode}`
                        : SPLIT_CHILD_BADGE_HINT
                    }
                  >
                    <Tag color="blue">{SPLIT_CHILD_BADGE_LABEL}</Tag>
                  </Tooltip>
                </span>
              ) : null}
              {record.projectName ? (
                <Tooltip title={record.projectName}>
                  <span className={styles.identityMeta}>{record.projectName}</span>
                </Tooltip>
              ) : null}
            </div>
          );
        },
      },
      {
        title: 'PM',
        key: 'pm',
        width: 100,
        ellipsis: true,
        render: (_, record) => {
          const name = record.projectManager?.name?.trim() || '—';
          return (
            <Tooltip title={name === '—' ? undefined : name}>
              <span className={styles.personCell}>{name}</span>
            </Tooltip>
          );
        },
      },
      {
        title: 'SL',
        key: 'quantity',
        width: 56,
        align: 'right',
        render: (_, record) => (
          <span className={styles.qtyCell}>{record.quantity > 0 ? record.quantity : '—'}</span>
        ),
      },
      {
        title: 'Deadline',
        key: 'deadlines',
        width: 118,
        render: (_, record) => {
          const pmLabel = formatQueueDeadline(getTaskDeadline(record));
          const creativeLabel = record.creativeDeadline
            ? formatQueueDeadline(record.creativeDeadline)
            : null;
          return (
            <div className={styles.deadlineCell}>
              <Tooltip title={`Deadline PM: ${pmLabel}`}>
                <span className={styles.deadlinePrimary}>{pmLabel}</span>
              </Tooltip>
              {creativeLabel ? (
                <Tooltip title={`Creative deadline: ${creativeLabel}`}>
                  <span className={styles.deadlineCreative}>CR {creativeLabel}</span>
                </Tooltip>
              ) : (
                <span className={styles.deadlineCreativeMuted}>CR —</span>
              )}
            </div>
          );
        },
      },
      {
        title: 'Urgency',
        key: 'urgency',
        width: 88,
        render: (_, record) => <ProjectUrgencyBadge urgency={resolveTaskUrgencyDisplay(record)} />,
      },
      {
        title: 'CM',
        key: 'cm',
        width: 110,
        ellipsis: true,
        render: (_, record) => {
          const name = record.creativeManager?.name?.trim() || '—';
          return (
            <Tooltip title={name === '—' ? undefined : name}>
              <span className={styles.personCell}>{name}</span>
            </Tooltip>
          );
        },
      },
      {
        title: 'Staff',
        key: 'staff',
        width: 110,
        ellipsis: true,
        render: (_, record) => {
          const label = pipelineAssigneeLabel(record, tasks);
          return (
            <Tooltip title={label === '—' ? undefined : label}>
              <span className={styles.personCell}>{label}</span>
            </Tooltip>
          );
        },
      },
      {
        title: 'Brief',
        width: 72,
        render: (_, record) =>
          needsChBrief(record) ? (
            <span className={`${styles.pill} ${styles.pillNeed}`}>Thiếu</span>
          ) : (
            <span className={`${styles.pill} ${styles.pillReady}`}>Đủ</span>
          ),
      },
      {
        title: 'Trạng thái',
        key: 'pipelineStage',
        width: 120,
        render: (_, record) => {
          const stage = resolveEffectivePipelineStage(record);
          if (!stage) return '—';
          const color =
            stage === 'awaiting_ch'
              ? 'orange'
              : stage === 'awaiting_cm'
                ? 'gold'
                : stage === 'returned_to_pm'
                  ? 'red'
                  : stage === 'split'
                    ? 'blue'
                    : 'green';
          return <Tag color={color}>{PIPELINE_STAGE_LABELS[stage]}</Tag>;
        },
      },
      {
        title: '',
        key: 'action',
        width: 108,
        fixed: 'right',
        render: (_, record) => (
          <Button
            type="link"
            className={styles.actionLink}
            onClick={(event) => {
              event.stopPropagation();
              openTask(record);
            }}
          >
            {queueActionLabel(record, view, role, user?.id)}
          </Button>
        ),
      },
    ],
    [tasks, view, role, user?.id],
  );

  const headReadOnly = !selected || !chEnabled || !isAwaitingCh(selected) || view !== 'ch';
  const managerReadOnly =
    !selected || !cmEnabled || !isAwaitingCm(selected) || view !== 'cm' || cmFrame !== 'intake';

  return (
    <div className={styles.page}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          showViewToggle ? (
            <Segmented
              value={view}
              onChange={(value) => setView(value as CreativeQueueView)}
              options={[
                { label: 'Hàng chờ CH', value: 'ch' },
                { label: 'Hàng chờ CM', value: 'cm' },
              ]}
            />
          ) : null
        }
      />

      {view === 'cm' ? (
        <Segmented
          className={styles.cmFrameToggle}
          value={cmFrame}
          onChange={(value) => setCmFrame(value as CreativeCmQueueFrame)}
          options={[
            { label: CREATIVE_CM_QUEUE_FRAME_LABELS.intake, value: 'intake' },
            { label: CREATIVE_CM_QUEUE_FRAME_LABELS.execution, value: 'execution' },
          ]}
        />
      ) : null}

      {actionableCount > 0 ? (
        <Alert
          className={styles.pageAlert}
          type="info"
          showIcon
          message={
            view === 'ch'
              ? chEnabled
                ? `${actionableCount} task cần xử lý và giao cho CM`
                : `${actionableCount} task CH đã trả về — đưa lại hàng chờ CH`
              : cmFrame === 'intake'
                ? `${actionableCount} task cần giao cho Staff`
                : `${actionableCount} task Staff chưa cập nhật`
          }
        />
      ) : null}

      <CardWrapper
        title={view === 'cm' ? CREATIVE_CM_QUEUE_FRAME_LABELS[cmFrame] : 'Danh sách task'}
      >
        <CreativeQueueFilters
          filters={listFilters}
          visibility={filterVisibility}
          projectOptions={projectOptions}
          onChange={setListFilters}
          onReset={() => setListFilters({ ...EMPTY_CREATIVE_QUEUE_FILTERS })}
        />
        <TableWrapper
          loading={isLoading}
          isEmpty={!isLoading && queue.length === 0}
          emptyTitle="Chưa có task trong hàng chờ"
          emptyDescription={
            scopedQueue.length > 0 && queue.length === 0
              ? 'Không có task khớp bộ lọc hiện tại. Thử Reset filter.'
              : view === 'ch'
                ? 'Task Creative từ PM sẽ xuất hiện tại đây khi cần bạn xử lý.'
                : cmFrame === 'intake'
                  ? 'Task Creative Head giao cho bạn sẽ xuất hiện tại đây.'
                  : 'Task đã giao Staff (nguyên hoặc chia nhỏ) sẽ xuất hiện tại đây.'
          }
        >
          <Table
            rowKey="id"
            size="middle"
            pagination={false}
            tableLayout="fixed"
            scroll={{ x: 1080 }}
            columns={columns}
            dataSource={queue}
            rowClassName={(record) => {
              if (isAwaitingCh(record) && needsChBrief(record)) return styles.rowNeedsBrief;
              if (isAwaitingCh(record)) return styles.rowHasBrief;
              return '';
            }}
            onRow={(record) => ({
              onClick: () => openTask(record),
            })}
          />
        </TableWrapper>
      </CardWrapper>

      <CreativeHeadAssignDrawer
        open={openHeadAssign}
        task={openHeadAssign ? selected : null}
        readOnly={headReadOnly}
        onClose={closeDrawer}
      />
      <CreativeManagerAssignDrawer
        open={openManagerAssign}
        task={openManagerAssign ? selected : null}
        readOnly={managerReadOnly}
        onClose={closeDrawer}
      />
      <CreativeEditDrawer open={openEdit} task={openEdit ? selected : null} onClose={closeDrawer} />
    </div>
  );
}
