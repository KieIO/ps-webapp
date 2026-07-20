import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { DepartmentList } from '@/features/departments/components/DepartmentList/DepartmentList';

export default function DepartmentManagementPage() {
  return (
    <div>
      <PageHeader
        title="Department management"
        subtitle="Manage departments used on projects, tasks, and task groups"
      />
      <DepartmentList />
    </div>
  );
}
