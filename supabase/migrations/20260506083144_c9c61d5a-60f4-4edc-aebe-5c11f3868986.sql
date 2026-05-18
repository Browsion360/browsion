CREATE POLICY "Public views published profiles"
ON public.patri_profiles
FOR SELECT
TO anon
USING (is_published = true);