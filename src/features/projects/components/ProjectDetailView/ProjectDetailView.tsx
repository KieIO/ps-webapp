import { useState } from 'react';
import { Alert, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import { EditProjectModal } from '../EditProjectModal/EditProjectModal';
import { ProjectClientNotesTab } from '../ProjectClientNotesTab/ProjectClientNotesTab';
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
        items={[
          {
            key: 'tasks',
            label: 'Tasks',
            children: <ProjectTasksTab project={project} />,
          },
          {
            key: 'notes',
            label: 'Client Notes',
            children: <ProjectClientNotesTab project={project} />,
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
