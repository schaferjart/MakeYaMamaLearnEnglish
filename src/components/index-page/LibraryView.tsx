import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Filter, RefreshCw, User } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { LibraryBook } from '@/types/book';
import type { LanguageCode } from '@/lib/languages';
import { BookCard } from '@/components/BookCard';

interface LibraryViewProps {
  books: LibraryBook[];
  loading: boolean;
  syncing: boolean;
  selectedLanguage: LanguageCode | 'all';
  onLanguageChange: (language: LanguageCode | 'all') => void;
  onSyncBooks: () => Promise<void>;
  languages: Array<{ code: LanguageCode; label: string }>;
  onStartReading: (bookId: string) => void;
}

export const LibraryView = ({
  books,
  loading,
  syncing,
  selectedLanguage,
  onLanguageChange,
  onSyncBooks,
  languages,
  onStartReading,
}: LibraryViewProps) => {
  const showBadge = selectedLanguage !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('library.title')}</h2>
          <p className="text-muted-foreground mt-1">
            {books.length > 0
              ? t('library.availableCount', { count: books.length })
              : t('library.empty.description')}
          </p>
        </div>
        <Button onClick={onSyncBooks} disabled={syncing} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? t('library.syncing') : t('library.sync')}
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by language:</span>
        </div>
        <Select value={selectedLanguage} onValueChange={(value) => onLanguageChange(value as LanguageCode | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map(({ code, label }) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showBadge && (
          <Badge variant="secondary" className="ml-2">
            {languages.find(({ code }) => code === selectedLanguage)?.label}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="aspect-[3/4] bg-muted rounded-md mb-4" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} {...book} onStartReading={onStartReading} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('library.empty.title')}</h3>
          <p className="text-muted-foreground mb-4">{t('library.empty.ctaDescription')}</p>
          <Button onClick={onSyncBooks} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? t('library.syncing') : t('library.sync')}
          </Button>
        </Card>
      )}

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">{t('integrations.status.title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('integrations.status.description')}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">{t('integration.badge.wordnik')}</Badge>
                <Badge variant="outline" className="text-xs">{t('integration.badge.deepl')}</Badge>
                <Badge variant="outline" className="text-xs">{t('integration.badge.tts')}</Badge>
                <Badge variant="outline" className="text-xs">{t('integration.badge.progress')}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
