-- Backfill translation_en and translation_fr from existing German where missing
-- Safe idempotent updates
UPDATE vocabulary
SET translation_en = translation_de
WHERE translation_en IS NULL AND translation_de IS NOT NULL;

UPDATE vocabulary
SET translation_fr = translation_de
WHERE translation_fr IS NULL AND translation_de IS NOT NULL;
