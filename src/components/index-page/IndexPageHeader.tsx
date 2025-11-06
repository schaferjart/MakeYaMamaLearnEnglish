import { BookOpen, Globe, Settings, Library, User, LogOut, HelpCircle, MessageCircle, BarChart3, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

export type IndexView = 'dashboard' | 'library' | 'conversations';

interface IndexPageHeaderProps {
  currentView: IndexView;
  onViewChange: (view: IndexView) => void;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
  userEmail?: string | null;
  languageLabel: string;
}

export const IndexPageHeader = ({
  currentView,
  onViewChange,
  onNavigate,
  onSignOut,
  userEmail,
  languageLabel,
}: IndexPageHeaderProps) => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">{t('app.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('app.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
              <User className="w-4 h-4" />
              {userEmail}
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{languageLabel}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/settings')}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/help')}>
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.signOut')}
            </Button>
          </div>
        </div>

        <nav className="flex gap-4 mt-4">
          <Button
            variant={currentView === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('dashboard')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {t('nav.dashboard')}
          </Button>
          <Button
            variant={currentView === 'library' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('library')}
          >
            <Library className="w-4 h-4 mr-2" />
            {t('library')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/vocabulary')}>
            <GraduationCap className="w-4 h-4 mr-2" />
            {t('nav.vocabulary')}
          </Button>
          <Button
            variant={currentView === 'conversations' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('conversations')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t('nav.conversations')}
          </Button>
        </nav>
      </div>
    </header>
  );
};
