import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, User, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/lib/locale';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { t } from '@/lib/i18n';

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { locale } = useLocale();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('nav.back')}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
              <p className="text-muted-foreground mt-1">{t('settings.description')}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>{t('settings.language.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('settings.language.interface')}
                </label>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('settings.language.interfaceDescription')}
                </p>
                <LocaleSwitcher className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t('settings.account.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('settings.account.email')}
                </label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full"
              >
                {t('settings.account.signOut')}
              </Button>
            </CardContent>
          </Card>

          {/* Learning Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>{t('settings.learning.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('settings.learning.description')}
              </p>
              <div className="text-sm text-muted-foreground">
                <p>• {t('settings.learning.feature1')}</p>
                <p>• {t('settings.learning.feature2')}</p>
                <p>• {t('settings.learning.feature3')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>{t('settings.privacy.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('settings.privacy.description')}
              </p>
              <div className="text-sm text-muted-foreground">
                <p>• {t('settings.privacy.feature1')}</p>
                <p>• {t('settings.privacy.feature2')}</p>
                <p>• {t('settings.privacy.feature3')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
