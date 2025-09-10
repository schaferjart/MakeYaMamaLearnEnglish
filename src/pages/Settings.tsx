import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { t, setLocale, locale } = useTranslation();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('settings.backToDashboard')}
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">{t('settings.language.title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('settings.language.description')}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={locale === 'en' ? 'default' : 'outline'}
                  onClick={() => setLocale('en')}
                >
                  English
                </Button>
                <Button
                  variant={locale === 'de' ? 'default' : 'outline'}
                  onClick={() => setLocale('de')}
                >
                  Deutsch
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
