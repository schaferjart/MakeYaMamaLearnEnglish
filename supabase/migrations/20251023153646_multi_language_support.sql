-- Multi-language learning platform support
-- This migration adds support for learning ANY language from ANY other language

-- Add language support to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS language_code VARCHAR(5) DEFAULT 'en';
ALTER TABLE books ADD COLUMN IF NOT EXISTS title_original TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS author_original TEXT;

-- Create language pairs table for user preferences
CREATE TABLE IF NOT EXISTS user_language_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_language VARCHAR(5) NOT NULL, -- Language learning FROM
  target_language VARCHAR(5) NOT NULL, -- User's native language  
  is_active BOOLEAN DEFAULT true,
  proficiency_level VARCHAR(10) DEFAULT 'A1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, source_language, target_language)
);

-- Enable RLS on new table
ALTER TABLE user_language_pairs ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_language_pairs
CREATE POLICY "Users can manage their own language pairs"
ON user_language_pairs FOR ALL
USING (auth.uid() = user_id);

-- Update vocabulary table for language pairs
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS target_language VARCHAR(5);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language_code);
CREATE INDEX IF NOT EXISTS idx_vocabulary_languages ON vocabulary(source_language, target_language);
CREATE INDEX IF NOT EXISTS idx_user_language_pairs_active ON user_language_pairs(user_id, is_active);

-- Add comments for documentation
COMMENT ON COLUMN books.language_code IS 'ISO language code of the book content (e.g., en, it, fr, de, es, hi)';
COMMENT ON COLUMN books.title_original IS 'Original title in the books native language';
COMMENT ON COLUMN books.author_original IS 'Original author name in the books native language';
COMMENT ON COLUMN user_language_pairs.source_language IS 'Language the user is learning FROM';
COMMENT ON COLUMN user_language_pairs.target_language IS 'Users native language for translations';
COMMENT ON COLUMN vocabulary.source_language IS 'Language of the vocabulary word';
COMMENT ON COLUMN vocabulary.target_language IS 'Language for the translation';

-- Update existing books to have language_code
UPDATE books SET language_code = 'en' WHERE language_code IS NULL;

