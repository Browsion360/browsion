UPDATE public.ad_units
SET
  enabled = false,
  zone_key = NULL,
  raw_html = NULL,
  notes = concat_ws(E'\n', NULLIF(notes, ''), 'Permanently disabled: mobile floating/sticky banner ads are blocked app-wide.')
WHERE slot = 'banner_320x50'
   OR (format = 'banner' AND width = 320 AND height = 50);