import ePub, { Book as EpubBook, NavItem } from 'epubjs';
import { supabase } from '@/integrations/supabase/client';

export interface EpubChapter {
  id: string;
  href: string;
  label: string;
  content: string;
  subitems: EpubChapter[];
  parent: string | null;
}

const flattenToc = (tocItems: NavItem[], parent: string | null = null): EpubChapter[] => {
  let flat: EpubChapter[] = [];
  for (const item of tocItems) {
    const chapter: EpubChapter = {
      id: item.id,
      href: item.href,
      label: item.label.trim(),
      content: '', // Will be loaded later
      subitems: [],
      parent: parent
    };
    if (item.subitems && item.subitems.length > 0) {
      chapter.subitems = flattenToc(item.subitems, item.id);
      flat = flat.concat(chapter.subitems);
    }
    flat.push(chapter);
  }
  return flat;
};

export const parseEpub = async (epubPath: string): Promise<{
  getChapter: (chapterId: string) => Promise<EpubChapter | null>;
  getChapterSentences: (chapterId: string) => Promise<string[]>;
  getChapterTitle: (chapterId: string) => Promise<string>;
  getParentChapter: (chapterId: string) => Promise<EpubChapter | null>;
}> => {
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('ebooks')
    .download(epubPath);

  if (downloadError) throw downloadError;
  if (!fileData) throw new Error('Failed to download EPUB file');

  const arrayBuffer = await fileData.arrayBuffer();
  const book = ePub(arrayBuffer);
  await book.ready;

  const flatToc = flattenToc(book.navigation.toc);

  const getChapterById = (chapterId: string) => {
    return flatToc.find(c => c.id === chapterId);
  };

  const loadChapterContent = async (chapter: EpubChapter) => {
    if (chapter.content) return chapter.content;
    const section = book.section(chapter.href);
    if (section) {
      await section.load(book.load.bind(book));
      const doc = section.document;
      if (doc && doc.body) {
        chapter.content = doc.body.innerHTML;
        return chapter.content;
      }
    }
    return '';
  };

  return {
    getChapter: async (chapterId: string) => {
      const chapter = getChapterById(chapterId);
      if (!chapter) return null;
      await loadChapterContent(chapter);
      return chapter;
    },
    getChapterSentences: async (chapterId: string) => {
      // Can't use `this` in returned object; call internal function directly
      const chapter = await (async () => {
        const c = getChapterById(chapterId);
        if (!c) return null;
        await loadChapterContent(c);
        return c;
      })();
      if (!chapter || !chapter.content) return [];
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = chapter.content;
      const text = tempDiv.textContent || '';
      return text.match(/[^.!?]+[.!?]+/g) || [];
    },
    getChapterTitle: async (chapterId: string) => {
      const chapter = getChapterById(chapterId);
      return chapter ? chapter.label : '';
    },
    getParentChapter: async (chapterId: string) => {
      const chapter = getChapterById(chapterId);
      if (chapter && chapter.parent) {
        return getChapterById(chapter.parent);
      }
      return null;
    }
  };
};
