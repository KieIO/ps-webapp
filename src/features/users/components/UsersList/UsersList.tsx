import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { UserFilters } from '../UserFilters/UserFilters';
import { UserTable } from '../UserTable/UserTable';
import { useUserList } from '../../hooks/useUserList';
import type { UserListFilters } from '../../schemas/user.schema';

const DEFAULT_FILTERS: UserListFilters = {};

export function UsersList() {
  const [filters, setFilters] = useState<UserListFilters>(DEFAULT_FILTERS);
  const [debouncedSearch] = useDebounce(filters.search, 300);

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const { data, isLoading } = useUserList(queryFilters);

  return (
    <>
      <UserFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <CardWrapper title="All users" subtitle={`${data?.total ?? 0} total`}>
        <UserTable users={data?.items ?? []} loading={isLoading} />
      </CardWrapper>
    </>
  );
}
