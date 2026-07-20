import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { useDepartmentList } from '../../hooks/useDepartmentList';
import type { Department } from '../../schemas/department.schema';
import { DepartmentFormModal } from '../DepartmentFormModal/DepartmentFormModal';
import { DepartmentTable } from '../DepartmentTable/DepartmentTable';

export function DepartmentList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const { data, isLoading } = useDepartmentList();

  return (
    <>
      <CardWrapper
        title="Departments"
        subtitle={`${data?.total ?? 0} total`}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Create department
          </Button>
        }
      >
        <DepartmentTable departments={data?.items ?? []} loading={isLoading} onEdit={setEditing} />
      </CardWrapper>

      <DepartmentFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <DepartmentFormModal
        open={Boolean(editing)}
        department={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
