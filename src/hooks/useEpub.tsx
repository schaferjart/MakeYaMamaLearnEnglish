import { useState, useEffect } from 'react';
import ePub, { Book as EpubBook, Rendition } from 'epubjs';
import { supabase } from '@/integrations/supabase/client';

export interface EpubChapter {
  id: string;
  href: string;
  label: string;
  content: string;
}

interface UseEpubReturn {
  book: EpubBook | null;
  chapters: EpubChapter[];
  currentChapter: EpubChapter | null;
  isLoading: boolean;
  error: string | null;
  loadChapter: (chapterId: string) => void;
  getFullText: () => string;
}

export const useEpub = (epubPath: string | null): UseEpubReturn => {
  const [book, setBook] = useState<EpubBook | null>(null);
  const [chapters, setChapters] = useState<EpubChapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<EpubChapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullText, setFullText] = useState<string>('');

  useEffect(() => {
    if (!epubPath) {
      setIsLoading(false);
      return;
    }

    const loadEpub = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get signed URL from Supabase storage
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from('ebooks')
          .createSignedUrl(epubPath, 3600); // 1 hour expiry

        if (urlError) throw urlError;
        if (!signedUrlData?.signedUrl) throw new Error('Failed to get signed URL');

        // Load EPUB with signed URL
        const epubBook = ePub(signedUrlData.signedUrl);
        await epubBook.ready;

        setBook(epubBook);

        // Extract navigation and chapters
        const navigation = epubBook.navigation;
        const extractedChapters: EpubChapter[] = [];
        let allText = '';

        for (const navItem of navigation.toc) {
          try {
            const section = epubBook.section(navItem.href);
            if (section) {
              await section.load(epubBook.load.bind(epubBook));
              const doc = section.document;
              
              if (doc) {
                // Extract text content
                const textContent = doc.body?.textContent || '';
                allText += textContent + '\n\n';

                extractedChapters.push({
                  id: navItem.id || navItem.href,
                  href: navItem.href,
                  label: navItem.label || `Chapter ${extractedChapters.length + 1}`,
                  content: textContent
                });
              }
            }
          } catch (err) {
            console.warn(`Failed to load chapter ${navItem.href}:`, err);
          }
        }

        // If no TOC, try to extract from spine by iterating through sections
        if (extractedChapters.length === 0) {
          let chapterIndex = 1;
          
          // Try to load up to 50 sections (reasonable limit for most books)
          for (let i = 0; i < 50; i++) {
            try {
              const section = epubBook.section(i);
              if (!section) break; // No more sections
              
              await section.load(epubBook.load.bind(epubBook));
              const doc = section.document;
              
              if (doc) {
                const textContent = doc.body?.textContent || '';
                if (textContent.trim()) {
                  allText += textContent + '\n\n';
                  
                  extractedChapters.push({
                    id: `chapter-${i}`,
                    href: section.href || `#chapter-${i}`,
                    label: `Chapter ${chapterIndex}`,
                    content: textContent
                  });
                  chapterIndex++;
                }
              }
            } catch (err) {
              // If we can't load this section, we've probably reached the end
              break;
            }
          }
        }

        setChapters(extractedChapters);
        setFullText(allText);
        
        // Set first chapter as current
        if (extractedChapters.length > 0) {
          setCurrentChapter(extractedChapters[0]);
        }

      } catch (err) {
        console.error('Error loading EPUB:', err);
        setError(err instanceof Error ? err.message : 'Failed to load EPUB');
      } finally {
        setIsLoading(false);
      }
    };

    loadEpub();
  }, [epubPath]);

  const loadChapter = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      setCurrentChapter(chapter);
    }
  };

  const getFullText = () => {
    return fullText || chapters.map(c => c.content).join('\n\n');
  };

  return {
    book,
    chapters,
    currentChapter,
    isLoading,
    error,
    loadChapter,
    getFullText
  };
};