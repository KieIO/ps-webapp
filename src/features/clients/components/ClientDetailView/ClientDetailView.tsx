import { useMemo } from 'react';
import { Alert, Table, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { buildProjectDetailPath } from '@/config/constants';
import { ClientKnowledgePanel } from '@/features/client-notes/components/ClientKnowledgePanel/ClientKnowledgePanel';
import { useProjectList } from '@/features/projects/hooks/useProjectList';
import type { Project } from '@/features/projects/schemas/project.schema';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
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
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
        width: 120,
        render: (code: string, project) => (
          <Link to={buildProjectDetailPath(project.id)}>{code}</Link>
        ),
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 140,
      },
      {
        title: 'PM',
        key: 'pm',
        width: 160,
        render: (_, project) => project.pm?.name ?? '—',
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
