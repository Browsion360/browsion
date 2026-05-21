
INSERT INTO public.ad_units (slot, label, provider, format, width, height, enabled, sort_order, notes) VALUES
  ('popunder',         'Popunder (site-wide)',           'adsterra', 'popunder', NULL, NULL, false, 10, 'Paste script URL in admin'),
  ('native',           'Native in-feed',                 'adsterra', 'native',   NULL, NULL, false, 20, 'Paste invoke.js URL + container id'),
  ('banner_728x90',    '728×90 Leaderboard (desktop)',   'adsterra', 'banner',   728,  90,   false, 30, 'Paste zone key'),
  ('banner_320x50',    '320×50 Mobile banner',           'adsterra', 'banner',   320,  50,   false, 40, 'Paste zone key'),
  ('banner_300x250',   '300×250 Medium rectangle',       'adsterra', 'banner',   300,  250,  false, 50, 'Paste zone key'),
  ('banner_160x600',   '160×600 Skyscraper (desktop)',   'adsterra', 'banner',   160,  600,  false, 60, 'Paste zone key'),
  ('banner_468x60',    '468×60 Above footer (desktop)',  'adsterra', 'banner',   468,  60,   false, 70, 'Paste zone key'),
  ('smartlink',        'Smartlink fallback',             'adsterra', 'smartlink',NULL, NULL, false, 80, 'Paste target URL')
ON CONFLICT DO NOTHING;
