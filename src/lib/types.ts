export interface DetailedProgress {
  percentage: number;
  currentPart: string;
  currentChapter: string;
  currentSentence: number;
  totalSentences: number;
}

export interface Book {
  id: string;
  title: string;
  author:string;
  year?: number;
  epub_path?: string;
  cover_url?: string;
  progress?: number;
  wordsLearned?: number;
  content?: string;
  detailedProgress?: DetailedProgress;
}
