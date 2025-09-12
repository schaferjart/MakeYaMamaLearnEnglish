-- Migration: add English and French translation columns for vocabulary entries (Option B)
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS translation_en text;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS translation_fr text;
-- Optional: comment for documentation
COMMENT ON COLUMN vocabulary.translation_de IS 'German translation (canonical)';
COMMENT ON COLUMN vocabulary.translation_en IS 'English translation (if user requested)';
COMMENT ON COLUMN vocabulary.translation_fr IS 'French translation (if user requested)';
