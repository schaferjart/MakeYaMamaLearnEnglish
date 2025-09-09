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

        // Helper function to recursively flatten the TOC
        const flattenToc = (tocItems) => {
          let flat = [];
          for (const item of tocItems) {
            flat.push(item);
            if (item.subitems && item.subitems.length > 0) {
              flat = flat.concat(flattenToc(item.subitems));
            }
          }
          return flat;
        };

        const navigation = epubBook.navigation;
        const toc = navigation.toc;
        const flatToc = flattenToc(toc);

        const extractedChapters: EpubChapter[] = [];
        let allText = '';

        if (flatToc.length > 0) {
            for (const navItem of flatToc) {
              try {
                // Don't process chapters with no label or href
                if (!navItem.label || !navItem.href) {
                    continue;
                }

                const label = navItem.label.trim();

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
                  }
                }
              } catch (err) {
                console.warn(`Failed to load chapter ${navItem.href}:`, err);
              }
            }
        } else if (epubBook.spine && epubBook.spine.items) {
            // Fallback for books with no TOC: load from spine
            let chapterIndex = 1;
            for (const section of epubBook.spine.items) {
                try {
                    await section.load(epubBook.load.bind(epubBook));
                    const doc = section.document;

                    if (doc && doc.body) {
                        const textContent = doc.body.textContent || '';
                        if (textContent.trim().length > 0) {
                            const htmlContent = doc.body.innerHTML;
                            allText += textContent + '\n\n';

                            extractedChapters.push({
                                id: section.idref || `chapter-${chapterIndex}`,
                                href: section.href,
                                label: section.idref || `Chapter ${chapterIndex}`,
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