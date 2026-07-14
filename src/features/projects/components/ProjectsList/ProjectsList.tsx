import { useMemo, useState } from 'react';
import { message } from 'antd';
import { useDebounce } from 'use-debounce';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { AssignProjectStaffModal } from '../AssignProjectStaffModal/AssignProjectStaffModal';
import { EditProjectModal } from '../EditProjectModal/EditProjectModal';
import { EvaluateProjectModal } from '../EvaluateProjectModal/EvaluateProjectModal';
import { ProjectFilters } from '../ProjectFilters/ProjectFilters';
import { ProjectSummaryBar } from '../ProjectSummaryBar/ProjectSummaryBar';
import { ProjectTable } from '../ProjectTable/ProjectTable';
import { UpdateProjectStatusModal } from '../UpdateProjectStatusModal/UpdateProjectStatusModal';
import { useArchiveProject, useUnarchiveProject } from '../../hooks/useArchiveProject';
import { useDeleteProject } from '../../hooks/useDeleteProject';
import { useProjectList } from '../../hooks/useProjectList';
import { exportProjectsToCsv } from '../../utils/exportProjects';
import { computeProjectStatusSummary } from '../../utils/projectSummary';
import type { Project, ProjectListFilters } from '../../schemas/project.schema';

interface ProjectsListProps {
  /** When true, lists archived projects and exposes unarchive. */
  archivedView?: boolean;
}

const DEFAULT_FILTERS: ProjectListFilters = {};

export function ProjectsList({ archivedView = false }: ProjectsListProps) {
  const [filters, setFilters] = useState<ProjectListFilters>(DEFAULT_FILTERS);
  const [exporting, setExporting] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusProject, setStatusProject] = useState<Project | null>(null);
  const [assigningProject, setAssigningProject] = useState<Project | null>(null);
  const [evaluatingProject, setEvaluatingProject] = useState<Project | null>(null);
  const [debouncedSearch] = useDebounce(filters.search, 300);

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch, archived: archivedView }),
    [filters, debouncedSearch, archivedView],
  );

  const { data, isLoading } = useProjectList(queryFilters);

  const summary = useMemo(() => computeProjectStatusSummary(data?.items ?? []), [data?.items]);
  const {
    mutate: deleteProject,
    isPending: isDeleting,
    variables: deletingVariables,
  } = useDeleteProject();
  const {
    mutate: archiveProject,
    isPending: isArchiving,
    variables: archivingVariables,
  } = useArchiveProject();
  const {
    mutate: unarchiveProject,
    isPending: isUnarchiving,
    variables: unarchivingVariables,
  } = useUnarchiveProject();

  const closeOpenModalsFor = (projectId: string) => {
    if (editingProject?.id === projectId) setEditingProject(null);
    if (statusProject?.id === projectId) setStatusProject(null);
    if (assigningProject?.id === projectId) setAssigningProject(null);
    if (evaluatingProject?.id === projectId) setEvaluatingProject(null);
  };

  const handleDelete = (project: Project) => {
    deleteProject(project.id, {
      onSuccess: () => closeOpenModalsFor(project.id),
    });
  };

  const handleArchive = (project: Project) => {
    archiveProject(project.id, {
      onSuccess: () => closeOpenModalsFor(project.id),
    });
  };

  const handleUnarchive = (project: Project) => {
    unarchiveProject(project.id);
  };

  const handleExport = () => {
    const items = data?.items ?? [];
    if (items.length === 0) {
      message.warning('Không có dự án để xuất.');
      return;
    }

    setExporting(true);
    try {
      exportProjectsToCsv(items);
      message.success('Đã tải file xuất.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <CardWrapper>
      <ProjectFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        onExport={handleExport}
        exporting={exporting}
      />

      {!archivedView ? <ProjectSummaryBar summary={summary} /> : null}

      <ProjectTable
        projects={data?.items ?? []}
        loading={isLoading}
        total={data?.total ?? 0}
        archivedView={archivedView}
        onUpdateStatus={archivedView ? undefined : setStatusProject}
        onAssign={archivedView ? undefined : setAssigningProject}
        onEdit={archivedView ? undefined : setEditingProject}
        onEvaluate={archivedView ? undefined : setEvaluatingProject}
        onArchive={archivedView ? undefined : handleArchive}
        onUnarchive={archivedView ? handleUnarchive : undefined}
        onDelete={handleDelete}
        deletingProjectId={isDeleting ? (deletingVariables ?? null) : null}
        archivingProjectId={isArchiving ? (archivingVariables ?? null) : null}
        unarchivingProjectId={isUnarchiving ? (unarchivingVariables ?? null) : null}
      />

      {!archivedView ? (
        <>
          <UpdateProjectStatusModal
            open={statusProject !== null}
            project={statusProject}
            onClose={() => setStatusProject(null)}
          />

          <AssignProjectStaffModal
            open={assigningProject !== null}
            project={assigningProject}
            onClose={() => setAssigningProject(null)}
          />

          <EditProjectModal
            open={editingProject !== null}
            project={editingProject}
            onClose={() => setEditingProject(null)}
          />

          <EvaluateProjectModal
            open={evaluatingProject !== null}
            project={evaluatingProject}
            onClose={() => setEvaluatingProject(null)}
          />
        </>
      ) : null}
    </CardWrapper>
  );
}
