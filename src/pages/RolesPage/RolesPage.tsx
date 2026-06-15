import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { PermissionMatrix } from '@/features/rbac/components/PermissionMatrix/PermissionMatrix';

export default function RolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Fixed organizational roles and their module access"
      />

      <PermissionMatrix />
    </div>
  );
}
