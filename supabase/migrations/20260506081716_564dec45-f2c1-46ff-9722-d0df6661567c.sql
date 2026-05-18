
-- Enums
create type public.app_role as enum ('admin', 'user');
create type public.plan_tier as enum ('free', 'ad_free', 'explorer');
create type public.payment_status as enum ('pending', 'approved', 'rejected');
create type public.marital_status as enum ('never', 'divorced', 'widowed');
create type public.skin_tone as enum ('fair', 'medium', 'wheatish', 'dark');
create type public.family_type as enum ('nuclear', 'joint');

-- User roles (separate table per security best practice)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins can view all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- App users (one row per auth user)
create table public.app_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  plan public.plan_tier not null default 'free',
  plan_expiry timestamptz,
  pref_age_min int,
  pref_age_max int,
  pref_district text,
  pref_education text,
  locale text not null default 'en',
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.app_users enable row level security;

create policy "Users view own record" on public.app_users
  for select to authenticated using (auth.uid() = user_id);
create policy "Users update own record" on public.app_users
  for update to authenticated using (auth.uid() = user_id);
create policy "Users insert own record" on public.app_users
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins view all users" on public.app_users
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update all users" on public.app_users
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Bride profiles (admin-curated)
create table public.patri_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int not null,
  height_cm int,
  skin_tone public.skin_tone,
  education text,
  profession text,
  income_range text,
  district text,
  religion text,
  sect text,
  family_type public.family_type,
  father_profession text,
  mother_profession text,
  siblings_count int,
  marital_status public.marital_status default 'never',
  about text,
  expectations text,
  photos text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.patri_profiles enable row level security;

create policy "Anyone authenticated views published profiles" on public.patri_profiles
  for select to authenticated using (is_published = true);
create policy "Admins view all profiles" on public.patri_profiles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage profiles" on public.patri_profiles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index patri_profiles_created_idx on public.patri_profiles (created_at desc);
create index patri_profiles_published_idx on public.patri_profiles (is_published, created_at desc);

-- Favourites
create table public.favourites (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.patri_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);
alter table public.favourites enable row level security;
create policy "Users manage own favourites" on public.favourites
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Unlocks (paid per profile)
create table public.unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.patri_profiles(id) on delete cascade,
  paid_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);
alter table public.unlocks enable row level security;
create policy "Users view own unlocks" on public.unlocks
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own unlocks" on public.unlocks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins view all unlocks" on public.unlocks
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.patri_profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "Users view own messages" on public.messages
  for select to authenticated using (auth.uid() = user_id);
create policy "Users send own messages" on public.messages
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins view all messages" on public.messages
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Payment requests
create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan public.plan_tier not null,
  amount int not null,
  sender_number text,
  txn_id text,
  status public.payment_status not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);
alter table public.payment_requests enable row level security;
create policy "Users view own payments" on public.payment_requests
  for select to authenticated using (auth.uid() = user_id);
create policy "Users create own payments" on public.payment_requests
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins view all payments" on public.payment_requests
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update payments" on public.payment_requests
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "Users view own notifications" on public.notifications
  for select to authenticated using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications
  for update to authenticated using (auth.uid() = user_id);
create policy "Admins insert any notifications" on public.notifications
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Users insert own notifications" on public.notifications
  for insert to authenticated with check (auth.uid() = user_id);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- Trigger: create app_users row + assign default 'user' role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email text := 'admin@prothomalap.app';
begin
  insert into public.app_users (user_id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role) values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  if new.email is not null and lower(new.email) = lower(admin_email) then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at triggers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger touch_app_users before update on public.app_users
  for each row execute function public.touch_updated_at();
create trigger touch_patri_profiles before update on public.patri_profiles
  for each row execute function public.touch_updated_at();

-- Storage bucket for patri photos (public read, admin-only write)
insert into storage.buckets (id, name, public) values ('patri-photos', 'patri-photos', true)
on conflict (id) do nothing;

create policy "Public can view patri photos" on storage.objects
  for select using (bucket_id = 'patri-photos');
create policy "Admins can upload patri photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'patri-photos' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can update patri photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'patri-photos' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete patri photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'patri-photos' and public.has_role(auth.uid(), 'admin'));
