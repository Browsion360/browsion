GRANT SELECT ON public.cta_links TO anon;
CREATE POLICY "Anon views active cta_links" ON public.cta_links FOR SELECT TO anon USING (is_active = true);