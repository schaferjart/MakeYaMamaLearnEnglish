-- Add Hindi translation column to vocabulary
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS translation_hi text;

COMMENT ON COLUMN vocabulary.translation_hi IS 'Hindi translation';

-- Optional backfill: copy German translations where Hindi missing (acts as placeholder)
UPDATE vocabulary
SET translation_hi = translation_de
WHERE translation_hi IS NULL AND translation_de IS NOT NULL;
