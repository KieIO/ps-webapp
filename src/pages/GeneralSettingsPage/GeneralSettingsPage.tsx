import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { GeneralSettingsPanel } from '@/features/settings/components/GeneralSettingsPanel/GeneralSettingsPanel';

export default function GeneralSettingsPage() {
  return (
    <div>
      <PageHeader
        title="General"
        subtitle="System-wide settings and maintenance actions"
      />
      <GeneralSettingsPanel />
    </div>
  );
}
