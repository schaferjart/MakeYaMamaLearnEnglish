export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  year?: number;
  epub_path?: string | null;
  coverUrl?: string | null;
  progress?: number;
  wordsLearned?: number;
  content?: string;
  language_code?: string | null;
}
