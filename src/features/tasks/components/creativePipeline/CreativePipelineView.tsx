import { Alert, Button, Segmented, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { ROLES } from '@/config/permissions';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import type { MyTask } from '../../schemas/task.schema';
import {
  canEditCreativePipelineTask,
  canProcessChQueue,
  canProcessCmQueue,
  countActionableQueueItems,
  defaultCreativeQueueView,
  filterCreativeQueue,
  isAwaitingCh,
  isAwaitingCm,
  needsChBrief,
  PIPELINE_STAGE_LABELS,
  pipelineAssigneeLabel,
  queueActionLabel,
  resolveEffectivePipelineStage,
  type CreativeQueueView,
} from '../../utils/creativePipeline';
import { CreativeEditDrawer } from './CreativeEditDrawer';
import { CreativeHeadAssignDrawer } from './CreativeHeadAssignDrawer';
import { CreativeManagerAssignDrawer } from './CreativeManagerAssignDrawer';
import styles from './creativePipeline.module.scss';

export function CreativePipelineView() {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;
  const [view, setView] = useState<CreativeQueueView>(defaultCreativeQueueView(role));
  const [selected, setSelected] = useState<MyTask | null>(null);

  useEffect(() => {
    setView(defaultCreativeQueueView(role));
  }, [role]);
  const { data, isLoading } = useMyTaskList({ taskCategory: 'project' });
  const tasks = useMemo(() => data?.items ?? [], [data?.items]);

  const queue = useMemo(
    () => filterCreativeQueue(tasks, view, user?.id, role),
    [tasks, view, user?.id, role],
  );
  const actionableCount = useMemo(
    () => countActionableQueueItems(tasks, view, user?.id, role),
    [tasks, view, user?.id, role],
  );

  const showViewToggle = role === ROLES.ADMIN || role === ROLES.PM;
  const chEnabled = canProcessChQueue(role);
  const cmEnabled = canProcessCmQueue(role);

  const openTask = (task: MyTask) => setSelected(task);
  const closeDrawer = () => setSelected(null);

  const openHeadAssign = Boolean(selected && view === 'ch' && isAwaitingCh(selected));
  const openManagerAssign = Boolean(selected && view === 'cm' && isAwaitingCm(selected));
  const openEdit = Boolean(
    selected &&
      !openHeadAssign &&
      !openManagerAssign &&
      (canEditCreativePipelineTask(selected, role, user?.id) ||
        resolveEffectivePipelineStage(selected) !== 'awaiting_ch'),
  );

  const title = view === 'cm' ? 'Hàng chờ Creative Manager' : 'Hàng chờ Creative Head';
  const subtitle =
    view === 'cm'
      ? 'Nhận task từ Creative Head, rồi giao nguyên hoặc chia nhỏ cho Staff.'
      : 'Nhận task từ PM, bổ sung brief nếu cần, rồi giao cho Creative Manager.';

  const columns: ColumnsType<MyTask> = [
    {
      title: 'Task',
      key: 'identity',
      render: (_, record) => {
        const meta = [record.projectName, record.projectManager?.name].filter(Boolean).join(' · ');
        return (
          <div className={styles.identityCell}>
            <span className={styles.identityCode}>{record.taskCode}</span>
            <Tooltip title={record.taskName}>
              <span className={styles.identityName}>{record.taskName}</span>
            </Tooltip>
            {meta ? (
              <Tooltip title={meta}>
                <span className={styles.identityMeta}>{meta}</span>
              </Tooltip>
            ) : null}
          </div>
        );
      },
    },
    {
      title: 'Brief',
      width: 88,
      render: (_, record) =>
        needsChBrief(record) ? (
          <span className={`${styles.pill} ${styles.pillNeed}`}>Thiếu</span>
        ) : (
          <span className={`${styles.pill} ${styles.pillReady}`}>Đủ</span>
        ),
    },
    {
      title: 'Deadline',
      dataIndex: 'date',
      width: 72,
      render: (value: string) => dayjs(value).format('DD/MM'),
    },
    {
      title: 'Người nhận',
      key: 'assignee',
      width: 140,
      ellipsis: true,
      render: (_, record) => {
        const label = pipelineAssigneeLabel(record, tasks);
        return (
          <Tooltip title={label}>
            <span className={styles.assigneeCell}>{label}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'pipelineStage',
      width: 128,
      render: (_, record) => {
        const stage = resolveEffectivePipelineStage(record);
        if (!stage) return '—';
        const color =
          stage === 'awaiting_ch'
            ? 'orange'
            : stage === 'awaiting_cm'
              ? 'gold'
              : stage === 'split'
                ? 'blue'
                : 'green';
        return <Tag color={color}>{PIPELINE_STAGE_LABELS[stage]}</Tag>;
      },
    },
    {
      title: '',
      key: 'action',
      width: 120,
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
  ];

  const headReadOnly = !selected || !chEnabled || !isAwaitingCh(selected) || view !== 'ch';
  const managerReadOnly = !selected || !cmEnabled || !isAwaitingCm(selected) || view !== 'cm';

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

      {actionableCount > 0 ? (
        <Alert
          className={styles.pageAlert}
          type="info"
          showIcon
          message={
            view === 'ch'
              ? `${actionableCount} task cần xử lý và giao cho CM`
              : `${actionableCount} task cần giao cho Staff`
          }
        />
      ) : null}

      <CardWrapper title="Danh sách task">
        <TableWrapper
          loading={isLoading}
          isEmpty={!isLoading && queue.length === 0}
          emptyTitle="Chưa có task trong hàng chờ"
          emptyDescription={
            view === 'ch'
              ? 'Task Creative từ PM sẽ xuất hiện tại đây khi cần bạn xử lý.'
              : 'Task Creative Head giao cho bạn sẽ xuất hiện tại đây.'
          }
        >
          <Table
            rowKey="id"
            size="middle"
            pagination={false}
            tableLayout="fixed"
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
