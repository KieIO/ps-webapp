import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal/CreateProjectModal';
import { ProjectsList } from '@/features/projects/components/ProjectsList/ProjectsList';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Dự án"
        subtitle="Danh sách dự án và đánh giá"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Tạo dự án
          </Button>
        }
      />
      <ProjectsList />
      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
