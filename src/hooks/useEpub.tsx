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

        // Extract navigation and chapters
        const navigation = epubBook.navigation;
        const extractedChapters: EpubChapter[] = [];
        let allText = '';
        const seenLabels = new Set<string>();

        for (const navItem of navigation.toc) {
          try {
            const label = navItem.label.trim();
            if (seenLabels.has(label)) {
              console.warn(`Skipping duplicate chapter label: ${label}`);
              continue; // Skip duplicate chapter
            }

            const section = epubBook.section(navItem.href);
            if (section) {
              await section.load(epubBook.load.bind(epubBook));
              const doc = section.document;
              
              if (doc && doc.body) {
                // Extract HTML content to preserve paragraphs
                const htmlContent = doc.body.innerHTML;
                const textContent = doc.body.textContent || '';
                allText += textContent + '\n\n';

                extractedChapters.push({
                  id: navItem.id || navItem.href,
                  href: navItem.href,
                  label: label || `Chapter ${extractedChapters.length + 1}`,
                  content: htmlContent, // Store HTML content
                });
                seenLabels.add(label);
              }
            }
          } catch (err) {
            console.warn(`Failed to load chapter ${navItem.href}:`, err);
          }
        }

        // If no TOC, try to extract from spine by iterating through sections
        if (extractedChapters.length === 0) {
          let chapterIndex = 1;
          
          // Try to load up to 100 sections (reasonable limit for most books)
          for (let i = 0; i < 100; i++) {
            try {
              const section = epubBook.section(i);
              if (!section) break; // No more sections
              
              await section.load(epubBook.load.bind(epubBook));
              const doc = section.document;
              
              if (doc && doc.body) {
                const textContent = doc.body.textContent || '';
                if (textContent.trim()) {
                  const htmlContent = doc.body.innerHTML;
                  allText += textContent + '\n\n';
                  
                  extractedChapters.push({
                    id: `chapter-${i}`,
                    href: section.href || `#chapter-${i}`,
                    label: `Chapter ${chapterIndex}`,
                    content: htmlContent, // Store HTML content
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