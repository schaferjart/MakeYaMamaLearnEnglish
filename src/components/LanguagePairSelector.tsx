import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Globe, CheckCircle } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type LanguageCode, type LanguagePair } from '@/lib/languages';
import { getUserLanguagePairs, createLanguagePair, deleteLanguagePair } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';

export const LanguagePairSelector = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [languagePairs, setLanguagePairs] = useState<LanguagePair[]>([]);
  const [newSourceLang, setNewSourceLang] = useState<LanguageCode>('en');
  const [newTargetLang, setNewTargetLang] = useState<LanguageCode>('de');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user) {
      loadLanguagePairs();
    }
  }, [user]);

  const loadLanguagePairs = async () => {
    try {
      setIsLoading(true);
      const pairs = await getUserLanguagePairs();
      setLanguagePairs(pairs);
    } catch (error) {
      console.error('Failed to load language pairs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load language pairs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLanguagePair = async () => {
    if (newSourceLang === newTargetLang) {
      toast({
        title: 'Invalid Selection',
        description: 'Source and target languages must be different',
        variant: 'destructive'
      });
      return;
    }

    // Check if pair already exists
    const exists = languagePairs.some(
      pair => pair.source_language === newSourceLang && pair.target_language === newTargetLang
    );

    if (exists) {
      toast({
        title: 'Language Pair Exists',
        description: 'This language pair is already configured',
        variant: 'destructive'
      });
      return;
    }

    setIsAdding(true);
    try {
      console.log('Creating language pair:', { newSourceLang, newTargetLang, user: user?.id });
      await createLanguagePair(newSourceLang, newTargetLang);
      await loadLanguagePairs();
      toast({
        title: 'Language Pair Added',
        description: `Added ${SUPPORTED_LANGUAGES[newSourceLang].name} → ${SUPPORTED_LANGUAGES[newTargetLang].name}`,
      });
    } catch (error) {
      console.error('Failed to add language pair:', error);
      toast({
        title: 'Error',
        description: 'Failed to add language pair',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteLanguagePair = async (id: string) => {
    try {
      await deleteLanguagePair(id);
      await loadLanguagePairs();
      toast({
        title: 'Language Pair Removed',
        description: 'Language pair has been removed',
      });
    } catch (error) {
      console.error('Failed to delete language pair:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove language pair',
        variant: 'destructive'
      });
    }
  };

  const getLanguageDisplay = (code: LanguageCode) => {
    const lang = SUPPORTED_LANGUAGES[code];
    return `${lang.name}`;
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Your Learning Languages
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure which languages you want to learn and your native language for translations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing language pairs */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : languagePairs.length > 0 ? (
          <div className="space-y-3">
            {languagePairs.map((pair) => (
              <div key={pair.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{SUPPORTED_LANGUAGES[pair.source_language as LanguageCode].name}</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{SUPPORTED_LANGUAGES[pair.target_language as LanguageCode].name}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {pair.proficiency_level}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteLanguagePair(pair.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No language pairs configured yet.</p>
            <p className="text-sm">Add your first language pair below to get started.</p>
          </div>
        )}

        {/* Add new language pair */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Add New Language Pair</h4>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Learning Language (Source)
              </label>
              <Select value={newSourceLang} onValueChange={(value) => setNewSourceLang(value as LanguageCode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                    <SelectItem key={code} value={code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center pt-6">
              <span className="text-muted-foreground">→</span>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Your Native Language (Target)
              </label>
              <Select value={newTargetLang} onValueChange={(value) => setNewTargetLang(value as LanguageCode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                    <SelectItem key={code} value={code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAddLanguagePair} 
                disabled={isAdding || isLoading}
                className="h-10"
              >
                {isAdding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            This will allow you to read books in {getLanguageDisplay(newSourceLang)} and get translations in {getLanguageDisplay(newTargetLang)}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

