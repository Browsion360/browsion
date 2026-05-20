
CREATE OR REPLACE FUNCTION public.generate_profile_slug(_name text, _district text, _age integer, _id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base TEXT;
  candidate TEXT;
  suffix INT := 1;
  parts TEXT;
BEGIN
  parts := public.bn_to_latin(COALESCE(_name,'')) || '-' || COALESCE(_age::TEXT,'');
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
$function$;

UPDATE public.patri_profiles
SET slug = public.generate_profile_slug(name, district, age, id);
