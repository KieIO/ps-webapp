import { useState } from 'react';
import { Alert, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { buildClientDetailPath } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import { useProjectList } from '@/features/projects/hooks/useProjectList';
import type { ClientNote } from '../../schemas/clientNote.schema';
import { useClientNotes } from '../../hooks/useClientNotes';
import { ClientNoteFormModal } from '../ClientNoteFormModal/ClientNoteFormModal';
import { ClientNoteList } from '../ClientNoteList/ClientNoteList';

interface ClientKnowledgePanelProps {
  clientId: string;
  clientName?: string;
  /** When set, new notes default to this related project. */
  defaultRelatedProjectId?: string | null;
  /** Show link to full client detail (useful from project context). */
  showOpenClientLink?: boolean;
}

export function ClientKnowledgePanel({
  clientId,
  clientName,
  defaultRelatedProjectId,
  showOpenClientLink = false,
}: ClientKnowledgePanelProps) {
  const { can } = usePermission();
  const canEdit = can('EDIT_PROJECT');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClientNote | null>(null);

  const { data, isLoading, isError } = useClientNotes(clientId);
  const { data: projectsData } = useProjectList(
    { clientId },
    { enabled: Boolean(clientId) && modalOpen },
  );

  const relatedProjectOptions = (projectsData?.items ?? []).map((project) => ({
    id: project.id,
    label: `${project.code} — ${project.name}`,
  }));

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (note: ClientNote) => {
    setEditing(note);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  if (isLoading) {
    return <GlobalLoadingSpinner />;
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unable to load client knowledge"
        description="Try again or check that you have access to this client."
      />
    );
  }

  const noteCount = data?.total ?? 0;
  const subtitleParts = [
    noteCount === 1 ? '1 note' : `${noteCount} notes`,
    clientName ? `for ${clientName}` : null,
    'shared across all projects',
  ].filter(Boolean);

  return (
    <>
      <CardWrapper
        title="Knowledge"
        subtitle={
          <>
            {subtitleParts.join(' · ')}
            {showOpenClientLink ? (
              <>
                {' · '}
                <Link to={buildClientDetailPath(clientId)}>Open client</Link>
              </>
            ) : null}
          </>
        }
        actions={
          canEdit ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add note
            </Button>
          ) : undefined
        }
      >
        <ClientNoteList
          clientId={clientId}
          notes={data?.items ?? []}
          canEdit={canEdit}
          onEdit={openEdit}
        />
      </CardWrapper>

      {canEdit ? (
        <ClientNoteFormModal
          open={modalOpen}
          clientId={clientId}
          note={editing}
          relatedProjectOptions={relatedProjectOptions}
          defaultRelatedProjectId={defaultRelatedProjectId}
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}
