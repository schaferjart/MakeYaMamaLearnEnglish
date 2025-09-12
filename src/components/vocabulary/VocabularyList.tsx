import React, { useState, useEffect } from 'react';
import { useLocale } from '@/lib/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VocabularyEntry } from "@/lib/api";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { BookOpen, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/i18n";

interface VocabularyListProps {
  vocabulary: VocabularyEntry[];
  onRefresh: () => void;
}

interface BookInfo {
  id: string;
  title: string;
  author: string;
}

// Utility function to clean XML tags from text
const cleanXmlTags = (text: string): string => {
  if (!text) return text;
  return text.replace(/<xref[^>]*>([^<]*)<\/xref>/g, '$1');
};

export const VocabularyList: React.FC<VocabularyListProps> = ({
  vocabulary,
  onRefresh
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { locale } = useLocale();
  const [books, setBooks] = useState<Record<string, BookInfo>>({});

  // Fetch book information for all unique book IDs
  useEffect(() => {
    const fetchBooks = async () => {
      const uniqueBookIds = [...new Set(vocabulary.map(v => v.book_id).filter(Boolean))];
      
      if (uniqueBookIds.length === 0) return;

      try {
        const { data: booksData, error } = await supabase
          .from('books')
          .select('id, title, author')
          .in('id', uniqueBookIds);

        if (error) throw error;

        const booksMap = (booksData || []).reduce((acc, book) => {
          acc[book.id] = book;
          return acc;
        }, {} as Record<string, BookInfo>);

        setBooks(booksMap);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [vocabulary]);

  const handleDelete = async (wordId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete word:', wordId);
    setDeleteConfirm(null);
    onRefresh();
  };

  const getDifficultyColor = (pos?: string) => {
    switch (pos?.toLowerCase()) {
      case 'noun':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'verb':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'adjective':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'adverb':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupedByBook = vocabulary.reduce((groups, word) => {
    const bookId = word.book_id || 'unknown';
    if (!groups[bookId]) {
      groups[bookId] = [];
    }
    groups[bookId].push(word);
    return groups;
  }, {} as Record<string, VocabularyEntry[]>);

  const getBookTitle = (bookId: string): string => {
  if (bookId === 'unknown') return t('reader.book.unknown');
    const book = books[bookId];
  return book ? t('vocab.list.byAuthor', { title: book.title, author: book.author }) : t('vocab.list.bookIdFallback', { id: bookId.slice(0, 8) });
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedByBook).map(([bookId, words]) => (
        <Card key={bookId} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-primary" />
              {getBookTitle(bookId)}
              <Badge variant="outline" className="ml-auto">
                {t('vocab.list.wordsCount', { count: words.length })}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Word Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-foreground">
                          {word.headword}
                        </h3>
                        {word.pos && (
                          <Badge 
                            variant="outline" 
                            className={getDifficultyColor(word.pos)}
                          >
                            {word.pos}
                          </Badge>
                        )}
                        <TextToSpeechButton
                          text={word.headword}
                          size="sm"
                          variant="ghost"
                        />
                      </div>

                      {/* Translation */}
                      {(() => {
                        const order: string[] = [
                          locale === 'de' ? 'translation_de' : locale === 'en' ? 'translation_en' : 'translation_fr',
                          'translation_de','translation_en','translation_fr'
                        ];
                        for (const key of order) {
                          const val = (word as any)[key];
                          if (typeof val === 'string' && val.trim()) {
                            return <p className="text-primary font-medium">→ {val}</p>;
                          }
                        }
                        return null;
                      })()}

                      {/* Definition */}
                      {word.sense && (
                        <p className="text-muted-foreground text-sm">
                          {cleanXmlTags(word.sense)}
                        </p>
                      )}

                      {/* Example */}
                      {word.example && (
                        <div className="bg-muted/50 rounded-md p-3 border-l-4 border-primary/30">
                          <p className="text-sm italic">
                            "{cleanXmlTags(word.example)}"
                          </p>
                        </div>
                      )}

                      {/* Synonym */}
                      {word.synonym && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">{t('vocab.list.label.synonym')} </span>
                          <span className="text-foreground font-medium">{word.synonym}</span>
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t('vocab.list.label.saved')}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      {deleteConfirm === word.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(word.id!)}
                          >
                            {t('vocab.list.action.delete')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            {t('vocab.list.action.cancel')}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(word.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};