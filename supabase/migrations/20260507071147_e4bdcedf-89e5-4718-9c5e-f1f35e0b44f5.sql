UPDATE public.ad_units
SET
  enabled = false,
  script_url = NULL,
  raw_html = NULL,
  notes = concat_ws(E'\n', NULLIF(notes, ''), 'Permanently disabled: Social Bar / in-page push ads are blocked app-wide.')
WHERE slot = 'social_bar'
   OR format = 'social_bar';