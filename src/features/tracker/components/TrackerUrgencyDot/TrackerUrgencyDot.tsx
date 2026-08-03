import { Popover } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useState } from 'react';
import { PROJECT_URGENCY_SETTING_STYLES } from '@/features/projects/constants';
import { useUpdateProjectUrgency } from '@/features/projects/hooks/useUpdateProjectUrgency';
import { PROJECT_URGENCIES, type ProjectUrgency } from '@/features/projects/schemas/project.schema';
import { usePermission } from '@/shared/hooks/usePermission';
import type { TrackerProject } from '../../schemas/tracker.schema';
import { TRACKER_URGENCY_STYLES } from '../../constants';
import styles from './TrackerUrgencyDot.module.scss';
import viewStyles from '../ProjectTrackerView/ProjectTrackerView.module.scss';

interface TrackerUrgencyDotProps {
  project: TrackerProject;
}

export function TrackerUrgencyDot({ project }: TrackerUrgencyDotProps) {
  const { can } = usePermission();
  const canEdit = can('EDIT_PROJECT');
  const [open, setOpen] = useState(false);
  const { mutate, isPending, variables } = useUpdateProjectUrgency();
  const isUpdating = isPending && variables?.id === project.id;
  const selectedSetting = project.urgencySetting ?? project.urgency;
  const urgencyStyle = TRACKER_URGENCY_STYLES[project.urgency];

  const dot = (
    <span
      className={classNames(
        viewStyles.urgencyDot,
        viewStyles[`urgencyDot_${project.urgency}`],
        canEdit && styles.interactive,
        isUpdating && styles.updating,
      )}
      title={canEdit ? 'Đổi mức ưu tiên' : urgencyStyle.label}
      role={canEdit ? 'button' : undefined}
      tabIndex={canEdit ? 0 : undefined}
      aria-label={canEdit ? `Đổi mức ưu tiên (${urgencyStyle.label})` : urgencyStyle.label}
      onKeyDown={
        canEdit
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setOpen(true);
              }
            }
          : undefined
      }
    />
  );

  if (!canEdit) {
    return dot;
  }

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      content={
        <div className={styles.menu} role="menu">
          {PROJECT_URGENCIES.map((value) => {
            const setting = PROJECT_URGENCY_SETTING_STYLES[value];
            const isSelected = selectedSetting === value;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                className={classNames(styles.option, isSelected && styles.optionSelected)}
                disabled={isUpdating}
                onClick={() => {
                  if (isSelected) {
                    setOpen(false);
                    return;
                  }
                  mutate(
                    { id: project.id, urgency: value as ProjectUrgency },
                    { onSuccess: () => setOpen(false) },
                  );
                }}
              >
                <span className={styles.optionDot} style={{ backgroundColor: setting.dot }} />
                <span className={styles.optionLabel}>{setting.label}</span>
                {isSelected ? <CheckOutlined className={styles.check} /> : null}
              </button>
            );
          })}
        </div>
      }
    >
      {dot}
    </Popover>
  );
}
