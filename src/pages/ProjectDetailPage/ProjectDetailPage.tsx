import { useState } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { CreateTaskDrawer } from '@/features/tasks/components/CreateTaskDrawer/CreateTaskDrawer';
import { ProjectDetailView } from '@/features/projects/components/ProjectDetailView/ProjectDetailView';
import { useProject } from '@/features/projects/hooks/useProjectList';
import { usePermission } from '@/shared/hooks/usePermission';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermission();
  const { data: project } = useProject(id ?? '');
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = can('CREATE_TASK') && Boolean(project) && !project?.archivedAt;

  const title = project
    ? `Project Detail — ${project.code}`
    : id
      ? 'Project Detail'
      : 'Project Detail';

  return (
    <div>
      <PageHeader
        title={title}
        subtitle="Timeline, tasks, and client knowledge"
        actions={
          <>
            {canCreate ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                Tạo task
              </Button>
            ) : null}
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.PROJECTS)}>
              Back to projects
            </Button>
          </>
        }
      />

      {id ? <ProjectDetailView projectId={id} /> : null}

      {canCreate && project ? (
        <CreateTaskDrawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          preset={{
            projectName: project.name,
            projectManager: project.pm,
            lockProject: true,
          }}
        />
      ) : null}
    </div>
  );
}
