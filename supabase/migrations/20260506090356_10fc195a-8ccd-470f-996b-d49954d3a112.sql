ALTER TABLE public.patri_profiles
  ADD COLUMN IF NOT EXISTS weight_kg integer,
  ADD COLUMN IF NOT EXISTS current_location text,
  ADD COLUMN IF NOT EXISTS ancestral_address text,
  ADD COLUMN IF NOT EXISTS children_info text,
  ADD COLUMN IF NOT EXISTS visit_note text;