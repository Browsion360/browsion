CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads app_settings" ON public.app_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage app_settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER app_settings_touch
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.app_settings (key, value) VALUES (
  'sticky_banner',
  '{"enabled": true, "max_closes_per_session": 3, "reappear_seconds": 10, "session_minutes": 15}'::jsonb
) ON CONFLICT (key) DO NOTHING;