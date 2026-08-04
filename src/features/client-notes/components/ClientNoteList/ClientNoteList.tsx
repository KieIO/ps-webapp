import { Button, Empty, Popconfirm, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { buildProjectDetailPath } from '@/config/constants';
import { CLIENT_NOTE_CATEGORY_LABELS, type ClientNote } from '../../schemas/clientNote.schema';
import { useDeleteClientNote } from '../../hooks/useClientNotes';
import styles from './ClientNoteList.module.scss';

interface ClientNoteListProps {
  clientId: string;
  notes: ClientNote[];
  canEdit: boolean;
  onEdit: (note: ClientNote) => void;
}

function formatNoteTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function ClientNoteList({ clientId, notes, canEdit, onEdit }: ClientNoteListProps) {
  const {
    mutate: deleteNote,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteClientNote(clientId);

  if (notes.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No knowledge for this client yet. Capture preferences, feedback, or process so the next project team does not start from zero."
      />
    );
  }

  return (
    <ul className={styles.list}>
      {notes.map((note) => {
        const title = note.title.trim() || CLIENT_NOTE_CATEGORY_LABELS[note.category];
        return (
          <li key={note.id} className={styles.item}>
            <div className={styles.header}>
              <div className={styles.meta}>
                <Tag>{CLIENT_NOTE_CATEGORY_LABELS[note.category]}</Tag>
                <Typography.Text strong>{title}</Typography.Text>
              </div>
              {canEdit ? (
                <div className={styles.actions}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    aria-label="Edit note"
                    onClick={() => onEdit(note)}
                  />
                  <Popconfirm
                    title="Delete this note?"
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => deleteNote(note.id)}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label="Delete note"
                      loading={isDeleting && deletingId === note.id}
                    />
                  </Popconfirm>
                </div>
              ) : null}
            </div>

            <p className={styles.body}>{note.body}</p>

            <div className={styles.footer}>
              <Typography.Text type="secondary" className={styles.footerText}>
                {note.updatedByName || note.createdByName} · {formatNoteTimestamp(note.updatedAt)}
              </Typography.Text>
              {note.relatedProjectId ? (
                <Link
                  to={buildProjectDetailPath(note.relatedProjectId)}
                  className={styles.projectLink}
                >
                  {note.relatedProjectCode
                    ? `${note.relatedProjectCode} — ${note.relatedProjectName}`
                    : 'Related project'}
                </Link>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
