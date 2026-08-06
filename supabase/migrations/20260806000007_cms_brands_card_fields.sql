-- Migration: add card management columns to cms_brands
ALTER TABLE IF EXISTS cms_brands
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_link  text;
UPDATE cms_brands SET is_visible = true WHERE is_visible IS NULL;
