import { useState } from 'react';
import { Alert, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { ClientKnowledgePanel } from '@/features/client-notes/components/ClientKnowledgePanel/ClientKnowledgePanel';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import { EditProjectModal } from '../EditProjectModal/EditProjectModal';
import { ProjectBriefTab } from '../ProjectBriefTab/ProjectBriefTab';
import { ProjectHistoryTab } from '../ProjectHistoryTab/ProjectHistoryTab';
import { ProjectSummaryCard } from '../ProjectSummaryCard/ProjectSummaryCard';
import { ProjectTasksTab } from '../ProjectTasksTab/ProjectTasksTab';
import { useArchiveProject, useUnarchiveProject } from '../../hooks/useArchiveProject';
import { useDeleteProject } from '../../hooks/useDeleteProject';
import { useProject } from '../../hooks/useProjectList';
import styles from './ProjectDetailView.module.scss';

interface ProjectDetailViewProps {
  projectId: string;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const { data: project, isLoading, isError } = useProject(projectId);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const { mutate: archiveProject, isPending: isArchiving } = useArchiveProject();
  const { mutate: unarchiveProject, isPending: isUnarchiving } = useUnarchiveProject();

  const handleDelete = () => {
    deleteProject(projectId, {
      onSuccess: () => {
        setEditOpen(false);
        navigate(ROUTES.PROJECTS);
      },
    });
  };

  const handleArchive = () => {
    archiveProject(projectId, {
      onSuccess: () => {
        setEditOpen(false);
        navigate(ROUTES.PROJECTS_ARCHIVED);
      },
    });
  };

  const handleUnarchive = () => {
    unarchiveProject(projectId, {
      onSuccess: () => {
        navigate(ROUTES.PROJECTS);
      },
    });
  };

  if (isLoading) {
    return <GlobalLoadingSpinner />;
  }

  if (isError || !project) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unable to load project"
        description="The project may have been removed or you may not have access."
      />
    );
  }

  return (
    <>
      <div className={styles.summary}>
        <ProjectSummaryCard
          project={project}
          onEdit={() => setEditOpen(true)}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          isArchiving={isArchiving}
          isUnarchiving={isUnarchiving}
        />
      </div>

      <Tabs
        className={styles.tabs}
        defaultActiveKey="tasks"
        destroyOnHidden
        items={[
          {
            key: 'tasks',
            label: 'Tasks',
            children: <ProjectTasksTab project={project} />,
          },
          {
            key: 'brief',
            label: 'Project Brief',
            children: <ProjectBriefTab project={project} />,
          },
          {
            key: 'knowledge',
            label: 'Client Knowledge',
            children: project.clientId ? (
              <ClientKnowledgePanel
                clientId={project.clientId}
                clientName={project.client?.name}
                defaultRelatedProjectId={project.id}
                showOpenClientLink
              />
            ) : (
              <Alert
                type="info"
                showIcon
                message="No client linked"
                description="Assign a client to this project to use Client Knowledge."
              />
            ),
          },
          {
            key: 'history',
            label: 'History',
            children: <ProjectHistoryTab />,
          },
        ]}
      />

      <EditProjectModal open={editOpen} project={project} onClose={() => setEditOpen(false)} />
    </>
  );
}
