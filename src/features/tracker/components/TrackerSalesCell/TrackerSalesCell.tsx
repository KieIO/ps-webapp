import { CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import type { MouseEvent } from 'react';
import { useUpdateProjectSalesName } from '@/features/projects/hooks/useUpdateProjectSalesName';
import { usePermission } from '@/shared/hooks/usePermission';
import type { TrackerProject } from '../../schemas/tracker.schema';
import type { SalesQuickTarget } from '../SalesQuickModal/SalesQuickModal';
import styles from './TrackerSalesCell.module.scss';

interface TrackerSalesCellProps {
  project: TrackerProject;
  onOpenSales: (target: SalesQuickTarget) => void;
}

export function TrackerSalesCell({ project, onOpenSales }: TrackerSalesCellProps) {
  const { can } = usePermission();
  const canEdit = can('EDIT_PROJECT') || can('EDIT_TRACKER_PROJECT');
  const { mutate, isPending, variables } = useUpdateProjectSalesName();
  const isUpdating = isPending && variables?.id === project.id;

  const currentValue = project.salesName?.trim() ?? '';

  const stopRowNav = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const openModal = (event: MouseEvent) => {
    stopRowNav(event);
    onOpenSales({
      projectId: project.id,
      projectName: project.name,
      salesName: currentValue,
    });
  };

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
          onClick={openModal}
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
        onClick={openModal}
      >
        Sales: {currentValue}
      </button>
      <button
        type="button"
        className={styles.clearBtn}
        title="Xóa Sales"
        aria-label="Xóa Sales"
        disabled={isUpdating}
        onClick={(event) => {
          stopRowNav(event);
          mutate({ id: project.id, salesName: '' });
        }}
      >
        <CloseOutlined />
      </button>
    </div>
  );
}
