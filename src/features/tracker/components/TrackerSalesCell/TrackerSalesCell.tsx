import { CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useUpdateProjectSalesName } from '@/features/projects/hooks/useUpdateProjectSalesName';
import { usePermission } from '@/shared/hooks/usePermission';
import type { TrackerProject } from '../../schemas/tracker.schema';
import styles from './TrackerSalesCell.module.scss';

interface TrackerSalesCellProps {
  project: TrackerProject;
}

export function TrackerSalesCell({ project }: TrackerSalesCellProps) {
  const { can } = usePermission();
  const canEdit = can('EDIT_PROJECT') || can('EDIT_TRACKER_PROJECT');
  const { mutate, isPending, variables } = useUpdateProjectSalesName();
  const isUpdating = isPending && variables?.id === project.id;

  const currentValue = project.salesName?.trim() ?? '';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(currentValue);
    }
  }, [currentValue, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = (next: string) => {
    const normalized = next.trim();
    setEditing(false);
    if (normalized === currentValue) return;
    mutate({ id: project.id, salesName: normalized });
  };

  const cancel = () => {
    setDraft(currentValue);
    setEditing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit(draft);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  };

  if (editing && canEdit) {
    return (
      <div className={styles.cell}>
        <input
          ref={inputRef}
          className={styles.input}
          value={draft}
          maxLength={255}
          disabled={isUpdating}
          aria-label="Sales"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className={styles.cell}>
        <span className={classNames(styles.value, !currentValue && styles.empty)}>
          {currentValue || '—'}
        </span>
      </div>
    );
  }

  return (
    <div className={classNames(styles.cell, styles.editable, isUpdating && styles.updating)}>
      <button
        type="button"
        className={classNames(styles.trigger, !currentValue && styles.triggerEmpty)}
        onClick={() => setEditing(true)}
        title={currentValue ? 'Sửa Sales' : 'Thêm Sales'}
        aria-label={currentValue ? `Sales: ${currentValue}` : 'Thêm Sales'}
      >
        {currentValue || 'Thêm sales'}
      </button>
      {currentValue ? (
        <button
          type="button"
          className={styles.clearBtn}
          title="Xóa Sales"
          aria-label="Xóa Sales"
          disabled={isUpdating}
          onClick={(event) => {
            event.stopPropagation();
            mutate({ id: project.id, salesName: '' });
          }}
        >
          <CloseOutlined />
        </button>
      ) : null}
    </div>
  );
}
