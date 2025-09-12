import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { VocabularyList } from "@/components/vocabulary/VocabularyList";
import { VocabularyQuiz } from "@/components/vocabulary/VocabularyQuiz";
import { VocabularyCards } from "@/components/vocabulary/VocabularyCards";
import { useVocabulary } from "@/hooks/useVocabulary";
import { 
  Library, 
  GraduationCap, 
  Brain, 
  Search, 
  BookOpen,
  ArrowLeft 
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useNavigate } from 'react-router-dom';

type ViewMode = 'library' | 'quiz' | 'cards';

const Vocabulary = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>();
  
  const { vocabulary, isLoading, refreshVocabulary } = useVocabulary(selectedBookId);

  const filteredVocabulary = vocabulary.filter(word => 
    word.headword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.translation_de?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackToHome = () => {
    navigate('/');
  };

  const renderViewModeContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (vocabulary.length === 0) {
      return (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('vocab.empty.title')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('vocab.empty.description')}
          </p>
          <Button onClick={handleBackToHome}>
            {t('vocab.action.toLibrary')}
          </Button>
        </Card>
      );
    }

    switch (viewMode) {
      case 'library':
        return (
          <VocabularyList 
            vocabulary={filteredVocabulary}
            onRefresh={refreshVocabulary}
          />
        );
      case 'quiz':
        return (
          <VocabularyQuiz 
            vocabulary={filteredVocabulary}
            onComplete={() => setViewMode('library')}
          />
        );
      case 'cards':
        return (
          <VocabularyCards 
            vocabulary={filteredVocabulary}
            onComplete={() => setViewMode('library')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToHome}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('common.back')}
              </Button>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Library className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">{t('vocab.library.title')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('vocab.library.count', { count: vocabulary.length })}
                </p>
              </div>
            </div>

            {/* Search */}
            {viewMode === 'library' && vocabulary.length > 0 && (
              <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('vocab.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
            )}
          </div>

          {/* Mode Navigation */}
          {vocabulary.length > 0 && (
            <nav className="flex gap-2 mt-4">
              <Button
                variant={viewMode === 'library' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('library')}
              >
                <Library className="w-4 h-4 mr-2" />
                {t('vocab.nav.list')}
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <Brain className="w-4 h-4 mr-2" />
                {t('vocab.nav.cards')}
              </Button>
              <Button
                variant={viewMode === 'quiz' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('quiz')}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                {t('vocab.nav.quiz')}
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderViewModeContent()}
      </main>
    </div>
  );
};

export default Vocabulary;