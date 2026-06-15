import { Button, Input, Select } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { FilterSection } from '@/shared/ui/FilterSection/FilterSection';
import {
  useProjectClientOptions,
  useProjectHeadNameOptions,
  useProjectPmOptions,
} from '../../hooks/useProjectList';
import { PROJECT_LEVEL_OPTIONS, PROJECT_FILTER_LABELS, STATUS_OPTIONS } from '../../constants';
import type { ProjectListFilters } from '../../schemas/project.schema';
import styles from './ProjectFilters.module.scss';

interface ProjectFiltersProps {
  filters: ProjectListFilters;
  onChange: (filters: ProjectListFilters) => void;
  onReset: () => void;
  onExport: () => void;
  exporting?: boolean;
}

export function ProjectFilters({
  filters,
  onChange,
  onReset,
  onExport,
  exporting,
}: ProjectFiltersProps) {
  const { data: clientOptions = [] } = useProjectClientOptions();
  const { data: pmOptions = [] } = useProjectPmOptions();
  const { data: headNameOptions = [] } = useProjectHeadNameOptions();

  return (
    <div className={styles.wrapper}>
      <FilterSection onReset={onReset} className={styles.filterSection}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="project-search">
            {PROJECT_FILTER_LABELS.search}
          </label>
          <Input.Search
            id="project-search"
            placeholder={PROJECT_FILTER_LABELS.searchPlaceholder}
            allowClear
            value={filters.search ?? ''}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value || undefined })
            }
            className={styles.search}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="project-client-filter">
            {PROJECT_FILTER_LABELS.client}
          </label>
          <Select
            id="project-client-filter"
            placeholder={PROJECT_FILTER_LABELS.clientPlaceholder}
            allowClear
            value={filters.client}
            onChange={(value) => onChange({ ...filters, client: value })}
            options={clientOptions.map((client) => ({ value: client, label: client }))}
            className={styles.select}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="project-status-filter">
            {PROJECT_FILTER_LABELS.status}
          </label>
          <Select
            id="project-status-filter"
            placeholder={PROJECT_FILTER_LABELS.statusPlaceholder}
            allowClear
            value={filters.status}
            onChange={(value) => onChange({ ...filters, status: value })}
            options={[...STATUS_OPTIONS]}
            className={styles.select}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="project-head-filter">
            {PROJECT_FILTER_LABELS.headName}
          </label>
          <Select
            id="project-head-filter"
            placeholder={PROJECT_FILTER_LABELS.headPlaceholder}
            allowClear
            showSearch
            optionFilterProp="label"
            value={filters.headName}
            onChange={(value) => onChange({ ...filters, headName: value })}
            options={headNameOptions.map((name) => ({ value: name, label: name }))}
            className={styles.select}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="project-pm-filter">
            {PROJECT_FILTER_LABELS.pm}
          </label>
          <Select
            id="project-pm-filter"
            placeholder={PROJECT_FILTER_LABELS.pmPlaceholder}
            allowClear
            value={filters.pmCode}
            onChange={(value) => onChange({ ...filters, pmCode: value })}
            options={pmOptions.map((pm) => ({
              value: pm.code,
              label: `${pm.code} — ${pm.name}`,
            }))}
            className={styles.select}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="project-level-filter">
            {PROJECT_FILTER_LABELS.level}
          </label>
          <Select
            id="project-level-filter"
            placeholder={PROJECT_FILTER_LABELS.levelPlaceholder}
            allowClear
            value={filters.projectLevel}
            onChange={(value) => onChange({ ...filters, projectLevel: value })}
            options={[...PROJECT_LEVEL_OPTIONS]}
            className={styles.select}
          />
        </div>
      </FilterSection>

      <Button
        icon={<DownloadOutlined />}
        onClick={onExport}
        loading={exporting}
        className={styles.export}
      >
        {PROJECT_FILTER_LABELS.export}
      </Button>
    </div>
  );
}
