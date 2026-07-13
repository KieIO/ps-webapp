import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { TASK_URGENCY_OPTIONS } from '../../constants';
import type { ProjectUrgency } from '@/features/projects/schemas/project.schema';
import { PROJECT_URGENCY_SETTING_STYLES } from '@/features/projects/constants';
import styles from './TaskUrgencySelect.module.scss';

type TaskUrgencySelectProps = Omit<
  SelectProps<ProjectUrgency>,
  'options' | 'optionRender' | 'labelRender'
>;

function UrgencyOptionLabel({ value }: { value: ProjectUrgency }) {
  const style = PROJECT_URGENCY_SETTING_STYLES[value];
  return (
    <span className={styles.option}>
      <span className={styles.dot} style={{ backgroundColor: style.dot }} aria-hidden />
      {style.label}
    </span>
  );
}

export function TaskUrgencySelect(props: TaskUrgencySelectProps) {
  return (
    <Select
      {...props}
      options={TASK_URGENCY_OPTIONS}
      placeholder="Select urgency"
      labelRender={({ value }) =>
        value ? <UrgencyOptionLabel value={value as ProjectUrgency} /> : null
      }
      optionRender={(option) => <UrgencyOptionLabel value={option.value as ProjectUrgency} />}
    />
  );
}
