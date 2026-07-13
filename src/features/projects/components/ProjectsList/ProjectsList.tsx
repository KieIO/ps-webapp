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
import { useDeleteProject } from '../../hooks/useDeleteProject';
import { useProjectList } from '../../hooks/useProjectList';
import { exportProjectsToCsv } from '../../utils/exportProjects';
import { computeProjectStatusSummary } from '../../utils/projectSummary';
import type { Project, ProjectListFilters } from '../../schemas/project.schema';

const DEFAULT_FILTERS: ProjectListFilters = {};

export function ProjectsList() {
  const [filters, setFilters] = useState<ProjectListFilters>(DEFAULT_FILTERS);
  const [exporting, setExporting] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusProject, setStatusProject] = useState<Project | null>(null);
  const [assigningProject, setAssigningProject] = useState<Project | null>(null);
  const [evaluatingProject, setEvaluatingProject] = useState<Project | null>(null);
  const [debouncedSearch] = useDebounce(filters.search, 300);

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const { data, isLoading } = useProjectList(queryFilters);

  const summary = useMemo(() => computeProjectStatusSummary(data?.items ?? []), [data?.items]);
  const {
    mutate: deleteProject,
    isPending: isDeleting,
    variables: deletingVariables,
  } = useDeleteProject();

  const handleDelete = (project: Project) => {
    deleteProject(project.id, {
      onSuccess: () => {
        if (editingProject?.id === project.id) setEditingProject(null);
        if (statusProject?.id === project.id) setStatusProject(null);
        if (assigningProject?.id === project.id) setAssigningProject(null);
        if (evaluatingProject?.id === project.id) setEvaluatingProject(null);
      },
    });
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

      <ProjectSummaryBar summary={summary} />

      <ProjectTable
        projects={data?.items ?? []}
        loading={isLoading}
        total={data?.total ?? 0}
        onUpdateStatus={setStatusProject}
        onAssign={setAssigningProject}
        onEdit={setEditingProject}
        onEvaluate={setEvaluatingProject}
        onDelete={handleDelete}
        deletingProjectId={isDeleting ? (deletingVariables ?? null) : null}
      />

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
    </CardWrapper>
  );
}
