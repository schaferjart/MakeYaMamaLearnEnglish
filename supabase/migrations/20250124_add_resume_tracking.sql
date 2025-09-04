-- Add resume tracking fields to reading_progress table
-- This enables exact position resume after conversations and app restarts

ALTER TABLE public.reading_progress 
ADD COLUMN IF NOT EXISTS chapter_id TEXT,                    -- Which chapter user was reading
ADD COLUMN IF NOT EXISTS last_sentence_index INTEGER DEFAULT 0; -- Which sentence they were on

-- Create index for efficient resume queries
CREATE INDEX IF NOT EXISTS idx_reading_progress_resume 
ON public.reading_progress(user_id, book_id, chapter_id, last_sentence_index);

-- Add comment for documentation
COMMENT ON COLUMN public.reading_progress.chapter_id IS 'ID of the chapter the user was reading (from EPUB structure)';
COMMENT ON COLUMN public.reading_progress.last_sentence_index IS 'Index of the last sentence the user was reading (0-based)'; 