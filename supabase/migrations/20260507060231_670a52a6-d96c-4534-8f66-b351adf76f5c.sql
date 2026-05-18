
CREATE TABLE public.ad_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text NOT NULL UNIQUE,
  label text NOT NULL,
  provider text NOT NULL DEFAULT 'adsterra',
  format text NOT NULL,
  width int,
  height int,
  script_url text,
  container_id text,
  zone_key text,
  raw_html text,
  target_url text,
  enabled boolean NOT NULL DEFAULT true,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public views enabled ads"
ON public.ad_units FOR SELECT
TO anon, authenticated
USING (enabled = true);

CREATE POLICY "Admins view all ads"
ON public.ad_units FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage ads"
ON public.ad_units FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER ad_units_touch
BEFORE UPDATE ON public.ad_units
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.ad_units (slot, label, provider, format, width, height, script_url, container_id, zone_key, target_url, sort_order) VALUES
  ('popunder',       'Popunder',        'adsterra', 'popunder',   NULL, NULL, 'https://pl29365560.profitablecpmratenetwork.com/be/5b/3e/be5b3e99ad51259f0dc16b2a52612dd1.js', NULL, NULL, NULL, 1),
  ('social_bar',     'Social Bar',      'adsterra', 'social_bar', NULL, NULL, 'https://pl29365562.profitablecpmratenetwork.com/17/05/e8/1705e8ef29a7698e0e5e12085f36fd85.js', NULL, NULL, NULL, 2),
  ('native',         'Native Banner',   'adsterra', 'native',     NULL, NULL, 'https://pl29365561.profitablecpmratenetwork.com/1063fd87ea50d46415b0b7e6cc7aa7c3/invoke.js', 'container-1063fd87ea50d46415b0b7e6cc7aa7c3', NULL, NULL, 3),
  ('banner_728x90',  '728×90 Banner',   'adsterra', 'banner',     728, 90,   NULL, NULL, 'ef5bcf6aa5d7e3608b0e851eed3ac9e0', NULL, 4),
  ('banner_320x50',  '320×50 Banner',   'adsterra', 'banner',     320, 50,   NULL, NULL, '10a172bb4e6d0e052ed3d2ea5a9febaa', NULL, 5),
  ('banner_300x250', '300×250 Banner',  'adsterra', 'banner',     300, 250,  NULL, NULL, '7ffdb028e8f0a994a657599f47b937c0', NULL, 6),
  ('banner_160x600', '160×600 Banner',  'adsterra', 'banner',     160, 600,  NULL, NULL, '2835bf235fae47e80c1773baa96bfbf7', NULL, 7),
  ('banner_160x300', '160×300 Banner',  'adsterra', 'banner',     160, 300,  NULL, NULL, 'e2cf9e527a7b0f16ba1f27b59d962257', NULL, 8),
  ('banner_468x60',  '468×60 Banner',   'adsterra', 'banner',     468, 60,   NULL, NULL, 'b79b70557a8fbf8d8db64d61c490884d', NULL, 9),
  ('smartlink',      'Smartlink',       'adsterra', 'smartlink',  NULL, NULL, NULL, NULL, NULL, 'https://www.profitablecpmratenetwork.com/ig1egjjd?key=778f909cf95eb3bbb2841cb7ab6b8b5e', 10);
