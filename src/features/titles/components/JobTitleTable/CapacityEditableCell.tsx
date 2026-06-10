import { InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import type { JobTitleListItem } from '../../schemas/title.schema';
import styles from './JobTitleTable.module.scss';

interface CapacityEditableCellProps {
  record: JobTitleListItem;
  field: 'dailyCapacityPoints' | 'taskConversionRatio';
  saving: boolean;
  onSave: (
    id: string,
    payload: Pick<JobTitleListItem, 'dailyCapacityPoints' | 'taskConversionRatio'>,
  ) => void;
}

export function CapacityEditableCell({
  record,
  field,
  saving,
  onSave,
}: CapacityEditableCellProps) {
  const value = record[field];
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const isRatio = field === 'taskConversionRatio';

  const normalizeDraft = (next: number | null): number => {
    const safe = Math.max(0, next ?? 0);
    return isRatio ? Math.min(100, safe) : safe;
  };

  const commit = () => {
    const normalized = normalizeDraft(draft);
    if (normalized !== draft) {
      setDraft(normalized);
    }
    if (normalized === value) return;

    onSave(record.id, {
      dailyCapacityPoints:
        field === 'dailyCapacityPoints' ? normalized : record.dailyCapacityPoints,
      taskConversionRatio:
        field === 'taskConversionRatio' ? normalized : record.taskConversionRatio,
    });
  };

  return (
    <InputNumber
      className={styles.capacityInput}
      value={draft}
      min={0}
      max={isRatio ? 100 : undefined}
      precision={0}
      disabled={saving}
      addonAfter={isRatio ? '%' : undefined}
      controls={false}
      onChange={(next) => setDraft(normalizeDraft(next))}
      onBlur={commit}
      onPressEnter={commit}
    />
  );
}
