
-- 1) app_users: prevent users from self-upgrading plan/plan_expiry
DROP POLICY IF EXISTS "Users update own record" ON public.app_users;
CREATE POLICY "Users update own record"
ON public.app_users
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND plan IS NOT DISTINCT FROM (SELECT plan FROM public.app_users WHERE user_id = auth.uid())
  AND plan_expiry IS NOT DISTINCT FROM (SELECT plan_expiry FROM public.app_users WHERE user_id = auth.uid())
);

-- 2) unlocks: remove user self-insert, admins only
DROP POLICY IF EXISTS "Users insert own unlocks" ON public.unlocks;
CREATE POLICY "Admins insert unlocks"
ON public.unlocks
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3) cta_links: restrict public read to authenticated users
DROP POLICY IF EXISTS "Public views active cta_links" ON public.cta_links;
CREATE POLICY "Authenticated views active cta_links"
ON public.cta_links
FOR SELECT
TO authenticated
USING (is_active = true);
