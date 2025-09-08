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

        // Download EPUB file as blob from Supabase storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('ebooks')
          .download(epubPath);

        if (downloadError) throw downloadError;
        if (!fileData) throw new Error('Failed to download EPUB file');

        // Convert blob to ArrayBuffer for EPUB.js
        const arrayBuffer = await fileData.arrayBuffer();

        // Load EPUB from ArrayBuffer
        const epubBook = ePub(arrayBuffer);
        await epubBook.ready;

        setBook(epubBook);

        // Create a map of the TOC for easy lookup
        const tocMap = new Map<string, { label: string; id: string }>();
        if (epubBook.navigation && epubBook.navigation.toc) {
          epubBook.navigation.toc.forEach(item => {
            // Normalize href to remove leading/trailing slashes and resolve relative paths
            const key = epubBook.path.resolve(item.href);
            if (item.label) {
              tocMap.set(key, { label: item.label.trim(), id: item.id || item.href });
            }
          });
        }

        const extractedChapters: EpubChapter[] = [];
        let allText = '';
        let chapterIndex = 1;

        if (epubBook.spine && epubBook.spine.items) {
          for (const section of epubBook.spine.items) {
            try {
              await section.load(epubBook.load.bind(epubBook));
              const doc = section.document;

              if (doc && doc.body) {
                const textContent = doc.body.textContent || '';
                // Only include sections that have meaningful text content
                if (textContent.trim().length > 0) {
                  const htmlContent = doc.body.innerHTML;
                  allText += textContent + '\n\n';

                  // Find the chapter label from the TOC map
                  const tocEntry = tocMap.get(section.canonical);
                  const label = tocEntry ? tocEntry.label : `Chapter ${chapterIndex}`;
                  const id = tocEntry ? tocEntry.id : section.idref || `chapter-${chapterIndex}`;

                  extractedChapters.push({
                    id,
                    href: section.href,
                    label,
                    content: htmlContent,
                  });

                  chapterIndex++;
                }
              }
            } catch (err) {
              console.warn(`Failed to load section ${section.href}:`, err);
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