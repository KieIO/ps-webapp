import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { ProjectDetailView } from '@/features/projects/components/ProjectDetailView/ProjectDetailView';
import { useProject } from '@/features/projects/hooks/useProjectList';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project } = useProject(id ?? '');

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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.PROJECTS)}>
            Back to projects
          </Button>
        }
      />

      {id ? <ProjectDetailView projectId={id} /> : null}
    </div>
  );
}
