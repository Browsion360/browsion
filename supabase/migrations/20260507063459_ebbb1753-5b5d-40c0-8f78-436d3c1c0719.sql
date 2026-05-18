-- Add slug column for clean permalinks
ALTER TABLE public.patri_profiles ADD COLUMN IF NOT EXISTS slug TEXT;

-- Slug generation function
CREATE OR REPLACE FUNCTION public.generate_profile_slug(_name TEXT, _district TEXT, _age INTEGER, _id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  suffix INT := 1;
  parts TEXT;
BEGIN
  -- Build raw string
  parts := COALESCE(_name, '') || '-' || COALESCE(_district, '') || '-' || COALESCE(_age::TEXT, '');
  -- Lowercase, replace non-alnum with hyphen
  base := lower(parts);
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := regexp_replace(base, '^-+|-+$', '', 'g');
  base := regexp_replace(base, '-+', '-', 'g');
  -- Truncate
  IF length(base) > 80 THEN base := substring(base, 1, 80); base := regexp_replace(base, '-+$', '', 'g'); END IF;
  -- Fallback when name is non-ASCII (Bangla etc.) — base may be empty or just numbers
  IF base IS NULL OR base = '' OR base !~ '[a-z]' THEN
    base := 'biodata-' || COALESCE(_age::TEXT, 'x') || '-' || substring(_id::TEXT, 1, 8);
  END IF;

  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.patri_profiles WHERE slug = candidate AND id <> _id) LOOP
    suffix := suffix + 1;
    candidate := base || '-' || suffix::TEXT;
  END LOOP;
  RETURN candidate;
END;
$$;

-- Trigger: assign slug on insert; on update only if slug missing
CREATE OR REPLACE FUNCTION public.patri_profiles_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_profile_slug(NEW.name, NEW.district, NEW.age, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_patri_profiles_slug ON public.patri_profiles;
CREATE TRIGGER trg_patri_profiles_slug
BEFORE INSERT OR UPDATE ON public.patri_profiles
FOR EACH ROW
EXECUTE FUNCTION public.patri_profiles_set_slug();

-- Backfill existing rows
UPDATE public.patri_profiles
SET slug = public.generate_profile_slug(name, district, age, id)
WHERE slug IS NULL OR slug = '';

-- Unique index
CREATE UNIQUE INDEX IF NOT EXISTS patri_profiles_slug_key ON public.patri_profiles(slug);