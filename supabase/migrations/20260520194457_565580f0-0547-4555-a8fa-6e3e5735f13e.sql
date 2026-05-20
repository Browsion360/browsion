
-- 1. app_settings: add is_public flag and restrict public SELECT
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
UPDATE public.app_settings SET is_public = true WHERE is_public = false;

DROP POLICY IF EXISTS "Public reads app_settings" ON public.app_settings;
CREATE POLICY "Public reads public app_settings"
ON public.app_settings FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- 2. Lock down SECURITY DEFINER helper functions from API roles.
--    Triggers still run them; they just aren't callable via PostgREST.
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.patri_profiles_set_slug() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_profile_slug(text, text, integer, uuid) FROM anon, authenticated, public;
-- has_role must remain callable so RLS policies referencing it work for authenticated users.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;

-- 3. user_roles: explicit defense-in-depth — only admins may INSERT/UPDATE/DELETE.
DROP POLICY IF EXISTS "Non-admins cannot modify roles" ON public.user_roles;
CREATE POLICY "Non-admins cannot modify roles"
ON public.user_roles AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
