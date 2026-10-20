import { Button, Divider, AutoComplete, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { usePermission } from '@/shared/hooks/usePermission';
import type { Project } from '../../schemas/project.schema';
import { CreateProjectModal } from '../CreateProjectModal/CreateProjectModal';

interface ProjectNameSelectFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  /** Fired when user picks a catalog project or finishes "+ Add" create. */
  onProjectApplied?: (project: Project) => void;
  /** Names shown in the dropdown (catalog + historic). */
  options: string[];
  /** Live Projects catalog — used to resolve PM when selecting a name. */
  catalogProjects: Project[];
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

export function ProjectNameSelectField({
  value,
  onChange,
  onProjectApplied,
  options,
  catalogProjects,
  disabled,
  placeholder = 'Chọn hoặc thêm project',
  id,
}: ProjectNameSelectFieldProps) {
  const { can } = usePermission();
  const canCreate = can('CREATE_PROJECT');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const trimmedSearch = search.trim();
  const typed = trimmedSearch || (value ?? '').trim();

  const exactMatch = useMemo(
    () => options.some((name) => name.trim().toLowerCase() === typed.toLowerCase()),
    [options, typed],
  );

  const canShowAdd = canCreate && typed.length > 0 && !exactMatch && !disabled;

  const applyByName = (rawName: string | undefined) => {
    const name = (rawName ?? '').trim();
    if (!name) return;
    onChange?.(name);
    const match = catalogProjects.find(
      (project) => project.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (match) onProjectApplied?.(match);
  };

  const handleCreated = (project: Project) => {
    onChange?.(project.name);
    onProjectApplied?.(project);
    setSearch('');
    setCreateOpen(false);
  };

  return (
    <>
      <AutoComplete
        id={id}
        value={value}
        disabled={disabled}
        options={options.map((name) => ({ value: name }))}
        placeholder={placeholder}
        onChange={(next) => onChange?.(next)}
        onSearch={setSearch}
        onSelect={(next) => applyByName(next)}
        onBlur={() => applyByName(value)}
        filterOption={(input, option) =>
          String(option?.value ?? '')
            .toLowerCase()
            .includes(input.trim().toLowerCase())
        }
        dropdownRender={(menu) => (
          <>
            {menu}
            {canShowAdd ? (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ padding: '0 8px 4px' }}>
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setCreateOpen(true)}
                    style={{ paddingInline: 0 }}
                  >
                    Add &quot;{typed}&quot;
                  </Button>
                </Space>
              </>
            ) : null}
          </>
        )}
      />
      {canCreate ? (
        <CreateProjectModal
          open={createOpen}
          initialName={typed}
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
          zIndex={1100}
        />
      ) : null}
    </>
  );
}
