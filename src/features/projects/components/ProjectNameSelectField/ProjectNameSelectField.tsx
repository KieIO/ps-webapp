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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Prefer live search text; fall back to committed value (e.g. after blur).
  const typed = (search.trim() || (value ?? '').trim()).trim();

  const exactMatch = useMemo(
    () => options.some((name) => name.trim().toLowerCase() === typed.toLowerCase()),
    [options, typed],
  );

  const canShowAdd = canCreate && typed.length > 0 && !exactMatch && !disabled;

  const filteredOptions = useMemo(() => {
    const query = typed.toLowerCase();
    return options
      .filter((name) => !query || name.trim().toLowerCase().includes(query))
      .map((name) => ({ value: name }));
  }, [options, typed]);

  const applyByName = (rawName: string | undefined) => {
    const name = (rawName ?? '').trim();
    if (!name) return;
    onChange?.(name);
    const match = catalogProjects.find(
      (project) => project.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (match) onProjectApplied?.(match);
  };

  const openCreate = () => {
    setDropdownOpen(false);
    setCreateOpen(true);
  };

  const handleCreated = (project: Project) => {
    onChange?.(project.name);
    onProjectApplied?.(project);
    setSearch('');
    setCreateOpen(false);
  };

  const addButton = canShowAdd ? (
    <Button
      type="link"
      icon={<PlusOutlined />}
      onMouseDown={(event) => event.preventDefault()}
      onClick={openCreate}
      style={{ paddingInline: 0 }}
    >
      Add &quot;{typed}&quot;
    </Button>
  ) : null;

  return (
    <>
      <AutoComplete
        id={id}
        value={value}
        disabled={disabled}
        open={dropdownOpen}
        options={filteredOptions}
        placeholder={placeholder}
        filterOption={false}
        onDropdownVisibleChange={setDropdownOpen}
        onChange={(next) => {
          onChange?.(next);
          setSearch(next);
          setDropdownOpen(true);
        }}
        onSearch={(next) => {
          setSearch(next);
          setDropdownOpen(true);
        }}
        onSelect={(next) => {
          applyByName(next);
          setSearch(next);
          setDropdownOpen(false);
        }}
        onBlur={() => applyByName(value)}
        notFoundContent={
          canShowAdd ? (
            <div style={{ padding: '4px 0' }}>{addButton}</div>
          ) : (
            'Không có project phù hợp'
          )
        }
        dropdownRender={(menu) => (
          <>
            {menu}
            {canShowAdd && filteredOptions.length > 0 ? (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ padding: '0 8px 4px' }}>{addButton}</Space>
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
