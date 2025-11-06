import { t } from '@/lib/i18n';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { VocabularyProgress } from '@/components/dashboard/VocabularyProgress';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

interface DashboardViewProps {
  onViewLibrary: () => void;
  onSyncBooks: () => Promise<void>;
  syncing: boolean;
  onContinueReading: (bookId: string) => void;
}

export const DashboardView = ({
  onViewLibrary,
  onSyncBooks,
  syncing,
  onContinueReading,
}: DashboardViewProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('nav.dashboard')}</h2>
        <p className="text-muted-foreground">{t('dashboard.description')}</p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VocabularyProgress />
        </div>
        <div className="space-y-6">
          <QuickActions onViewLibrary={onViewLibrary} onSyncBooks={onSyncBooks} syncing={syncing} />
          <RecentActivity onContinueReading={onContinueReading} />
        </div>
      </div>
    </div>
  );
};
