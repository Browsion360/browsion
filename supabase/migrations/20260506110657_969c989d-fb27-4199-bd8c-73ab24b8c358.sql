CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  admin_emails text[] := ARRAY['admin@prothomalap.app','raminxch@gmail.com'];
begin
  insert into public.app_users (user_id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role) values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  if new.email is not null and lower(new.email) = ANY(admin_emails) then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$function$;