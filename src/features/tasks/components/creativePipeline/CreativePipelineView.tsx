import { Alert, Button, Segmented, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { ROLES } from '@/config/permissions';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import type { MyTask } from '../../schemas/task.schema';
import {
  canProcessChQueue,
  canProcessCmQueue,
  countActionableQueueItems,
  defaultCreativeQueueView,
  filterCreativeQueue,
  isAwaitingCh,
  isAwaitingCm,
  needsChBrief,
  PIPELINE_STAGE_LABELS,
  queueActionLabel,
  resolveEffectivePipelineStage,
  type CreativeQueueView,
} from '../../utils/creativePipeline';
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

  const showViewToggle = role === ROLES.ADMIN;
  const chEnabled = canProcessChQueue(role);
  const cmEnabled = canProcessCmQueue(role);

  const openTask = (task: MyTask) => setSelected(task);
  const closeDrawer = () => setSelected(null);

  const title = view === 'cm' ? 'Task được giao từ Creative Head' : 'Task từ PM';
  const subtitle =
    view === 'cm'
      ? 'Nhận brief đã sẵn, giao nguyên task hoặc chia nhỏ cho Creative Staff'
      : 'Xử lý task Creative từ PM rồi assign cho Creative Manager';

  const columns: ColumnsType<MyTask> = [
    {
      title: 'Task Code',
      dataIndex: 'taskCode',
      width: 120,
      render: (value: string) => value,
    },
    {
      title: 'Tên task',
      dataIndex: 'taskName',
      ellipsis: true,
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      ellipsis: true,
    },
    {
      title: 'PM',
      dataIndex: ['projectManager', 'name'],
      width: 140,
    },
    {
      title: 'Loại brief',
      width: 140,
      render: (_, record) =>
        needsChBrief(record) ? (
          <span className={`${styles.pill} ${styles.pillNeed}`}>Cần fill brief</span>
        ) : (
          <span className={`${styles.pill} ${styles.pillReady}`}>Có brief</span>
        ),
    },
    {
      title: 'Ngày YC',
      dataIndex: 'date',
      width: 110,
      render: (value: string) => dayjs(value).format(DATE_FORMAT),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'pipelineStage',
      width: 130,
      render: (_, record) => {
        const stage = resolveEffectivePipelineStage(record);
        if (!stage) return '—';
        const color =
          stage === 'awaiting_ch' ? 'orange' : stage === 'awaiting_cm' ? 'gold' : 'green';
        return <Tag color={color}>{PIPELINE_STAGE_LABELS[stage]}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 170,
      render: (_, record) => (
        <Button type="link" onClick={() => openTask(record)}>
          {queueActionLabel(record, view)}
        </Button>
      ),
    },
  ];

  const headReadOnly = !selected || !chEnabled || !isAwaitingCh(selected) || view !== 'ch';
  const managerReadOnly = !selected || !cmEnabled || !isAwaitingCm(selected) || view !== 'cm';

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          showViewToggle ? (
            <Segmented
              value={view}
              onChange={(value) => setView(value as CreativeQueueView)}
              options={[
                { label: 'Inbox CH', value: 'ch' },
                { label: 'Inbox CM', value: 'cm' },
              ]}
            />
          ) : null
        }
      />

      {actionableCount > 0 ? (
        <Alert
          className={`${styles.banner} ${styles.bannerCount}`}
          type="info"
          showIcon
          message={
            view === 'ch'
              ? `Bạn có ${actionableCount} task mới từ PM — cần xử lý và assign cho CM`
              : `Bạn có ${actionableCount} task từ Creative Head — giao cho Staff hoặc chia nhỏ`
          }
        />
      ) : null}

      <CardWrapper title="Task chờ xử lý">
        <TableWrapper
          loading={isLoading}
          isEmpty={!isLoading && queue.length === 0}
          emptyTitle="Không có task trong hàng chờ"
          emptyDescription={
            view === 'ch'
              ? 'Khi PM chuyển task sang Creative, toàn bộ Creative Head sẽ thấy task ở đây.'
              : 'Khi Creative Head assign cho bạn, task sẽ xuất hiện ở đây để giao Staff.'
          }
        >
          <Table
            rowKey="id"
            size="middle"
            pagination={false}
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
        open={Boolean(selected) && view === 'ch'}
        task={view === 'ch' ? selected : null}
        readOnly={headReadOnly}
        onClose={closeDrawer}
      />
      <CreativeManagerAssignDrawer
        open={Boolean(selected) && view === 'cm'}
        task={view === 'cm' ? selected : null}
        readOnly={managerReadOnly}
        onClose={closeDrawer}
      />
    </div>
  );
}
