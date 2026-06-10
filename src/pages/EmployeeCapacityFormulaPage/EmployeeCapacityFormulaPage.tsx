import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { JobTitleList } from '@/features/titles/components/JobTitleList/JobTitleList';

export default function EmployeeCapacityFormulaPage() {
  return (
    <div>
      <PageHeader
        title="Employee capacity formula"
        subtitle="Configure how employee capacity is calculated"
      />
      <JobTitleList showCapacityColumns editableCapacity />
    </div>
  );
}
