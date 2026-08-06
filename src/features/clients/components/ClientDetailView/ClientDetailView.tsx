import { useMemo } from 'react';
import { Alert, Table, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ClientKnowledgePanel } from '@/features/client-notes/components/ClientKnowledgePanel/ClientKnowledgePanel';
import {
  PROJECT_NAME_COLUMN_LABEL,
  PROJECT_TABLE_COLUMN_HEADERS,
} from '@/features/projects/constants';
import { ProjectStatusBadge } from '@/features/projects/components/ProjectStatusBadge/ProjectStatusBadge';
import { useProjectList } from '@/features/projects/hooks/useProjectList';
import type { Project } from '@/features/projects/schemas/project.schema';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import { ProjectNameLink } from '@/shared/ui/ProjectNameLink/ProjectNameLink';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import { useClient } from '../../hooks/useClients';
import styles from './ClientDetailView.module.scss';

interface ClientDetailViewProps {
  clientId: string;
}

function ClientProjectsTab({ clientId }: { clientId: string }) {
  const { data: projectsData, isLoading } = useProjectList(
    { clientId },
    { enabled: Boolean(clientId) },
  );

  const projects = projectsData?.items ?? [];

  const projectColumns: ColumnsType<Project> = useMemo(
    () => [
      {
        title: 'Mã dự án',
        dataIndex: 'code',
        key: 'code',
        width: 160,
        render: (code: string) => code || '—',
      },
      {
        title: PROJECT_NAME_COLUMN_LABEL,
        dataIndex: 'name',
        key: 'name',
        render: (name: string, project) => <ProjectNameLink name={name} projectId={project.id} />,
      },
      {
        title: PROJECT_TABLE_COLUMN_HEADERS.status,
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (status: Project['status']) => <ProjectStatusBadge status={status} />,
      },
      {
        title: PROJECT_TABLE_COLUMN_HEADERS.pmName,
        key: 'pm',
        width: 180,
        render: (_, project) =>
          project.pm?.name ? (
            <UserNameLink name={project.pm.name} userId={project.pm.userId} showAvatar />
          ) : (
            '—'
          ),
      },
    ],
    [],
  );

  return (
    <CardWrapper title="Projects" subtitle={`${projectsData?.total ?? 0} total for this client`}>
      <TableWrapper
        loading={isLoading}
        isEmpty={!isLoading && projects.length === 0}
        emptyTitle="No projects found"
        emptyDescription="Projects linked to this client will appear here."
      >
        <Table rowKey="id" columns={projectColumns} dataSource={projects} pagination={false} />
      </TableWrapper>
    </CardWrapper>
  );
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const { data: client, isLoading, isError } = useClient(clientId);
  const { data: projectsData } = useProjectList({ clientId }, { enabled: Boolean(clientId) });

  if (isLoading) {
    return <GlobalLoadingSpinner />;
  }

  if (isError || !client) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unable to load client"
        description="The client may have been removed or you may not have access."
      />
    );
  }

  return (
    <Tabs
      className={styles.tabs}
      defaultActiveKey="knowledge"
      destroyOnHidden
      items={[
        {
          key: 'knowledge',
          label: 'Knowledge',
          children: <ClientKnowledgePanel clientId={client.id} clientName={client.name} />,
        },
        {
          key: 'projects',
          label: `Projects (${projectsData?.total ?? 0})`,
          children: <ClientProjectsTab clientId={client.id} />,
        },
      ]}
    />
  );
}
