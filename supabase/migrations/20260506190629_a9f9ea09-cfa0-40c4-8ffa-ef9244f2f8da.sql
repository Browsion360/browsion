
-- Enum
CREATE TYPE public.cta_kind AS ENUM ('whatsapp','imo','messenger','facebook','call','custom');

-- cta_links: global default rows have profile_id = NULL; per-profile overrides set profile_id
CREATE TABLE public.cta_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.cta_kind NOT NULL,
  label text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  profile_id uuid NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique per (kind, profile_id) including null profile_id
CREATE UNIQUE INDEX cta_links_kind_profile_uniq
  ON public.cta_links (kind, COALESCE(profile_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX cta_links_profile_idx ON public.cta_links(profile_id);

ALTER TABLE public.cta_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public views active cta_links"
  ON public.cta_links FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage cta_links"
  ON public.cta_links FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER cta_links_touch
  BEFORE UPDATE ON public.cta_links
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- cta_clicks: analytics
CREATE TABLE public.cta_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cta_link_id uuid NULL,
  kind public.cta_kind NOT NULL,
  profile_id uuid NULL,
  user_id uuid NULL,
  clicked_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cta_clicks_kind_idx ON public.cta_clicks(kind);
CREATE INDEX cta_clicks_profile_idx ON public.cta_clicks(profile_id);
CREATE INDEX cta_clicks_clicked_at_idx ON public.cta_clicks(clicked_at DESC);

ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone inserts cta_clicks"
  ON public.cta_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins view cta_clicks"
  ON public.cta_clicks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default global rows (inactive until admin sets URL)
INSERT INTO public.cta_links (kind, label, url, is_active, sort_order) VALUES
  ('whatsapp','WhatsApp নাম্বার দেখুন','', false, 1),
  ('imo','Imo তে কথা বলুন','', false, 2),
  ('messenger','Messenger এ মেসেজ','', false, 3),
  ('facebook','Facebook এ Add দিন','', false, 4),
  ('call','ফোন করুন','', false, 5);
