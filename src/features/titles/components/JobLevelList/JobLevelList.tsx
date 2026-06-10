import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { CreateJobLevelModal } from '../CreateJobLevelModal/CreateJobLevelModal';
import { JobLevelTable } from '../JobLevelTable/JobLevelTable';
import { useJobLevelList } from '../../hooks/useJobLevelList';

export function JobLevelList() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useJobLevelList();

  return (
    <>
      <CardWrapper
        title="Job levels"
        subtitle={`${data?.total ?? 0} total`}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Create job level
          </Button>
        }
      >
        <JobLevelTable levels={data?.items ?? []} loading={isLoading} />
      </CardWrapper>

      <CreateJobLevelModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
