import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { CreateJobGroupModal } from '../CreateJobGroupModal/CreateJobGroupModal';
import { JobGroupTable } from '../JobGroupTable/JobGroupTable';
import { useJobGroupList } from '../../hooks/useJobGroupList';

export function JobGroupList() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useJobGroupList();

  return (
    <>
      <CardWrapper
        title="Job groups"
        subtitle={`${data?.total ?? 0} total`}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Create job group
          </Button>
        }
      >
        <JobGroupTable groups={data?.items ?? []} loading={isLoading} />
      </CardWrapper>

      <CreateJobGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
