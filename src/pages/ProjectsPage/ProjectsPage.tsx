import { useState } from 'react';
import { Button, Space } from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal/CreateProjectModal';
import { ProjectsList } from '@/features/projects/components/ProjectsList/ProjectsList';
import { usePermission } from '@/shared/hooks/usePermission';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { can } = usePermission();
  const canCreate = can('CREATE_PROJECT');

  return (
    <div>
      <PageHeader
        title="Dự án"
        subtitle="Danh sách dự án và đánh giá"
        actions={
          <Space>
            <Link to={ROUTES.PROJECTS_ARCHIVED}>
              <Button icon={<InboxOutlined />}>Đã lưu trữ</Button>
            </Link>
            {canCreate ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                Tạo dự án
              </Button>
            ) : null}
          </Space>
        }
      />
      <ProjectsList />
      {canCreate ? (
        <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
      ) : null}
    </div>
  );
}
