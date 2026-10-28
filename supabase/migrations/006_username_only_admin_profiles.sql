-- New dashboard identities use only a username in public.profiles.
-- Password hashes remain exclusively in Supabase Auth (auth.users).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text;
begin
  v_username := lower(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));

  insert into public.profiles (id, username, role, is_active)
  values (new.id, v_username, 'staff', true)
  on conflict (id) do update set username = excluded.username;

  return new;
end $$;
