import { Button, Divider, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useClientList, useCreateClient } from '@/features/clients/hooks/useClients';

interface ClientSelectFieldProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

export function ClientSelectField({
  value,
  onChange,
  disabled,
  placeholder = 'Select or add client',
  id,
}: ClientSelectFieldProps) {
  const { data, isLoading } = useClientList();
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const [search, setSearch] = useState('');

  const clients = data?.items ?? [];
  const trimmedSearch = search.trim();

  const exactMatch = useMemo(
    () =>
      (data?.items ?? []).some(
        (client) => client.name.toLowerCase() === trimmedSearch.toLowerCase(),
      ),
    [data?.items, trimmedSearch],
  );

  const canCreate = trimmedSearch.length > 0 && !exactMatch;

  const handleCreate = () => {
    if (!canCreate || isCreating) return;
    createClient(
      { name: trimmedSearch },
      {
        onSuccess: (client) => {
          onChange?.(client.id);
          setSearch('');
        },
      },
    );
  };

  return (
    <Select
      id={id}
      showSearch
      allowClear
      disabled={disabled}
      loading={isLoading || isCreating}
      placeholder={placeholder}
      value={value || undefined}
      onChange={(next) => onChange?.(next)}
      onSearch={setSearch}
      filterOption={(input, option) =>
        String(option?.label ?? '')
          .toLowerCase()
          .includes(input.trim().toLowerCase())
      }
      options={clients.map((client) => ({
        value: client.id,
        label: client.name,
      }))}
      dropdownRender={(menu) => (
        <>
          {menu}
          {canCreate && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <Space style={{ padding: '0 8px 4px' }}>
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  loading={isCreating}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleCreate}
                  style={{ paddingInline: 0 }}
                >
                  Add &quot;{trimmedSearch}&quot;
                </Button>
              </Space>
            </>
          )}
        </>
      )}
    />
  );
}
