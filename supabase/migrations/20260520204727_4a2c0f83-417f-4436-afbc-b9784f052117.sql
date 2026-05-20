
-- Bangla → Latin transliteration helper
CREATE OR REPLACE FUNCTION public.bn_to_latin(_s text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE r text := COALESCE(_s, '');
BEGIN
  -- multi-char first (consonant clusters / aspirated)
  r := replace(r, 'ক্ষ', 'ksh');
  r := replace(r, 'জ্ঞ', 'gy');
  r := replace(r, 'ঞ্চ', 'nch');
  r := replace(r, 'ঞ্জ', 'nj');
  -- vowels
  r := replace(r,'অ','a'); r := replace(r,'আ','a'); r := replace(r,'ই','i'); r := replace(r,'ঈ','i');
  r := replace(r,'উ','u'); r := replace(r,'ঊ','u'); r := replace(r,'ঋ','ri');
  r := replace(r,'এ','e'); r := replace(r,'ঐ','oi'); r := replace(r,'ও','o'); r := replace(r,'ঔ','ou');
  -- consonants
  r := replace(r,'ক','k'); r := replace(r,'খ','kh'); r := replace(r,'গ','g'); r := replace(r,'ঘ','gh'); r := replace(r,'ঙ','ng');
  r := replace(r,'চ','ch'); r := replace(r,'ছ','chh'); r := replace(r,'জ','j'); r := replace(r,'ঝ','jh'); r := replace(r,'ঞ','n');
  r := replace(r,'ট','t'); r := replace(r,'ঠ','th'); r := replace(r,'ড','d'); r := replace(r,'ঢ','dh'); r := replace(r,'ণ','n');
  r := replace(r,'ত','t'); r := replace(r,'থ','th'); r := replace(r,'দ','d'); r := replace(r,'ধ','dh'); r := replace(r,'ন','n');
  r := replace(r,'প','p'); r := replace(r,'ফ','ph'); r := replace(r,'ব','b'); r := replace(r,'ভ','bh'); r := replace(r,'ম','m');
  r := replace(r,'য','y'); r := replace(r,'র','r'); r := replace(r,'ল','l'); r := replace(r,'শ','sh'); r := replace(r,'ষ','sh'); r := replace(r,'স','s'); r := replace(r,'হ','h');
  r := replace(r,'ড়','r'); r := replace(r,'ঢ়','rh'); r := replace(r,'য়','y'); r := replace(r,'ৎ','t'); r := replace(r,'ং','ng'); r := replace(r,'ঃ','h'); r := replace(r,'ঁ','n');
  -- vowel signs
  r := replace(r,'া','a'); r := replace(r,'ি','i'); r := replace(r,'ী','i'); r := replace(r,'ু','u'); r := replace(r,'ূ','u'); r := replace(r,'ৃ','ri');
  r := replace(r,'ে','e'); r := replace(r,'ৈ','oi'); r := replace(r,'ো','o'); r := replace(r,'ৌ','ou');
  r := replace(r,'্',''); -- virama
  -- digits
  r := translate(r,'০১২৩৪৫৬৭৮৯','0123456789');
  RETURN r;
END;
$$;

-- Updated slug generator that uses English transliteration
CREATE OR REPLACE FUNCTION public.generate_profile_slug(_name text, _district text, _age integer, _id uuid)
RETURNS text
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
  parts := public.bn_to_latin(COALESCE(_name,'')) || '-' || public.bn_to_latin(COALESCE(_district,'')) || '-' || COALESCE(_age::TEXT,'');
  base := lower(parts);
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := regexp_replace(base, '^-+|-+$', '', 'g');
  base := regexp_replace(base, '-+', '-', 'g');
  IF length(base) > 80 THEN base := regexp_replace(substring(base,1,80), '-+$', '', 'g'); END IF;
  IF base IS NULL OR base = '' OR base !~ '[a-z]' THEN
    base := 'biodata-' || COALESCE(_age::TEXT,'x') || '-' || substring(_id::TEXT,1,8);
  END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.patri_profiles WHERE slug = candidate AND id <> _id) LOOP
    suffix := suffix + 1;
    candidate := base || '-' || suffix::TEXT;
  END LOOP;
  RETURN candidate;
END;
$$;

-- Regenerate slugs for all existing profiles
UPDATE public.patri_profiles
SET slug = public.generate_profile_slug(name, district, age, id);
