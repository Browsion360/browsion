
-- Fix search_path on touch_updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

-- Restrict execute on SECURITY DEFINER funcs to authenticated only
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- Drop the broad public listing policy on storage.objects for the bucket.
-- Public buckets serve files via /storage/v1/object/public/... without needing this SELECT policy.
drop policy if exists "Public can view patri photos" on storage.objects;
