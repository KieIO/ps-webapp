import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PAGINATION } from '@/config/constants';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { getJobTitleFamilyKey } from '../../constants';
import { useUpdateJobTitleCapacity } from '../../hooks/useUpdateJobTitleCapacity';
import { computeSpecialistTaskPoints } from '../../utils/capacityFormula';
import type { JobTitleListItem } from '../../schemas/title.schema';
import { CapacityEditableCell } from './CapacityEditableCell';
import styles from './JobTitleTable.module.scss';

interface JobTitleTableProps {
  titles: JobTitleListItem[];
  loading: boolean;
  showCapacityColumns?: boolean;
  editableCapacity?: boolean;
}

const formatPoints = (value: number) => value.toLocaleString('vi-VN');

const getRowClassName = (record: JobTitleListItem, index: number, titles: JobTitleListItem[]) => {
  const family = getJobTitleFamilyKey(record.code);
  const previousFamily = index > 0 ? getJobTitleFamilyKey(titles[index - 1].code) : null;
  const isGroupStart = index > 0 && family !== previousFamily;

  return [styles.row, styles[`family-${family}`], isGroupStart ? styles.groupStart : '']
    .filter(Boolean)
    .join(' ');
};

export function JobTitleTable({
  titles,
  loading,
  showCapacityColumns = false,
  editableCapacity = false,
}: JobTitleTableProps) {
  const { mutate, isPending, variables } = useUpdateJobTitleCapacity();

  const handleCapacitySave = (
    id: string,
    payload: Pick<JobTitleListItem, 'dailyCapacityPoints' | 'taskConversionRatio'>,
  ) => {
    mutate({ id, payload });
  };

  const capacityColumns: ColumnsType<JobTitleListItem> = showCapacityColumns
    ? [
        {
          title: 'Capacity/ngày',
          key: 'dailyCapacityPoints',
          width: '12%',
          align: 'right',
          render: (_, record) =>
            editableCapacity ? (
              <CapacityEditableCell
                record={record}
                field="dailyCapacityPoints"
                saving={isPending && variables?.id === record.id}
                onSave={handleCapacitySave}
              />
            ) : (
              formatPoints(record.dailyCapacityPoints)
            ),
        },
        {
          title: 'Tỷ lệ CM/QL',
          key: 'taskConversionRatio',
          width: '11%',
          align: 'right',
          render: (_, record) =>
            editableCapacity ? (
              <CapacityEditableCell
                record={record}
                field="taskConversionRatio"
                saving={isPending && variables?.id === record.id}
                onSave={handleCapacitySave}
              />
            ) : (
              `${record.taskConversionRatio}%`
            ),
        },
        {
          title: 'Điểm task CM',
          key: 'specialistTaskPoints',
          width: '12%',
          align: 'right',
          render: (_, record) =>
            formatPoints(
              computeSpecialistTaskPoints(
                record.dailyCapacityPoints,
                record.taskConversionRatio,
              ),
            ),
        },
      ]
    : [];

  const columns: ColumnsType<JobTitleListItem> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: showCapacityColumns ? '9%' : 120,
    },
    {
      title: 'Title',
      dataIndex: 'name',
      key: 'name',
      width: showCapacityColumns ? '28%' : undefined,
      ellipsis: showCapacityColumns,
    },
    ...capacityColumns,
    {
      title: 'Job level',
      key: 'jobLevel',
      width: showCapacityColumns ? '14%' : 180,
      ellipsis: true,
      render: (_, record) => record.jobLevelLabel,
    },
    {
      title: 'Job group',
      key: 'jobGroup',
      width: showCapacityColumns ? '14%' : 140,
      render: (_, record) => record.jobGroupLabel,
    },
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && titles.length === 0}
      emptyTitle="No job titles found"
      emptyDescription="Try adjusting your search or filters, or create a new job title."
    >
      <Table
        className={showCapacityColumns ? styles.capacityTable : undefined}
        rowKey="id"
        columns={columns}
        dataSource={titles}
        rowClassName={(record) => {
          const globalIndex = titles.findIndex((title) => title.id === record.id);
          return getRowClassName(record, globalIndex, titles);
        }}
        pagination={{
          defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          showSizeChanger: {
            getPopupContainer: () => document.body,
          },
          pageSizeOptions: [...PAGINATION.PAGE_SIZE_OPTIONS],
          showTotal: (total) => `${total} job titles`,
        }}
      />
    </TableWrapper>
  );
}
