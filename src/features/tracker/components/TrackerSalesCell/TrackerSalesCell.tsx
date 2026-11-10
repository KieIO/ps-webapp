import { CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
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

  const stopRowNav = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (editing && canEdit) {
    return (
      <div className={styles.subtitle} onClick={stopRowNav} onMouseDown={stopRowNav}>
        <span className={styles.prefix}>Sales:</span>
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
    if (!currentValue) return null;
    return (
      <div className={styles.subtitle}>
        <span className={styles.value}>Sales: {currentValue}</span>
      </div>
    );
  }

  if (!currentValue) {
    return (
      <div
        className={classNames(styles.subtitle, styles.addOnly, isUpdating && styles.updating)}
        data-tracker-sales-add=""
      >
        <button
          type="button"
          className={styles.addBtn}
          title="Thêm Sales"
          aria-label="Thêm Sales"
          onClick={(event) => {
            stopRowNav(event);
            setEditing(true);
          }}
        >
          + Sales
        </button>
      </div>
    );
  }

  return (
    <div
      className={classNames(styles.subtitle, styles.editable, isUpdating && styles.updating)}
      onClick={stopRowNav}
      onMouseDown={stopRowNav}
    >
      <button
        type="button"
        className={styles.valueBtn}
        title="Sửa Sales"
        aria-label={`Sales: ${currentValue}`}
        onClick={() => setEditing(true)}
      >
        Sales: {currentValue}
      </button>
      <button
        type="button"
        className={styles.clearBtn}
        title="Xóa Sales"
        aria-label="Xóa Sales"
        disabled={isUpdating}
        onClick={() => mutate({ id: project.id, salesName: '' })}
      >
        <CloseOutlined />
      </button>
    </div>
  );
}
