ALTER TABLE public.patri_profiles
  ADD COLUMN IF NOT EXISTS region text NOT NULL DEFAULT 'bd',
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'bn';

ALTER TABLE public.patri_profiles
  ADD CONSTRAINT patri_profiles_region_chk CHECK (region IN ('bd','ar','es','global'));

CREATE INDEX IF NOT EXISTS idx_patri_profiles_region ON public.patri_profiles(region) WHERE is_published = true;