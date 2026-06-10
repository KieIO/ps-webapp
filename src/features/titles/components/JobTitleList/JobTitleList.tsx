import { useMemo, useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDebounce } from 'use-debounce';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { CreateJobTitleModal } from '../CreateJobTitleModal/CreateJobTitleModal';
import { JobTitleFilters } from '../JobTitleFilters/JobTitleFilters';
import { JobTitleTable } from '../JobTitleTable/JobTitleTable';
import { useJobTitleList } from '../../hooks/useJobTitleList';
import type { JobTitleListFilters } from '../../schemas/title.schema';

const DEFAULT_FILTERS: JobTitleListFilters = {};

interface JobTitleListProps {
  showCapacityColumns?: boolean;
  editableCapacity?: boolean;
}

export function JobTitleList({
  showCapacityColumns = false,
  editableCapacity = false,
}: JobTitleListProps) {
  const [filters, setFilters] = useState<JobTitleListFilters>(DEFAULT_FILTERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [debouncedSearch] = useDebounce(filters.search, 300);

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const { data, isLoading } = useJobTitleList(queryFilters);

  return (
    <>
      <JobTitleFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <CardWrapper
        title="Job titles"
        subtitle={`${data?.total ?? 0} total`}
        actions={
          editableCapacity ? undefined : (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Create job title
            </Button>
          )
        }
      >
        <JobTitleTable
          titles={data?.items ?? []}
          loading={isLoading}
          showCapacityColumns={showCapacityColumns}
          editableCapacity={editableCapacity}
        />
      </CardWrapper>

      {!editableCapacity && (
        <CreateJobTitleModal open={createOpen} onClose={() => setCreateOpen(false)} />
      )}
    </>
  );
}
