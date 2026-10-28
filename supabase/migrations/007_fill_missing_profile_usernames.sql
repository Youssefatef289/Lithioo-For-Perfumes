-- Backfill the username for legacy profiles that were created before username-only login.
-- Existing usernames are never changed.
with candidates as (
  select p.id, lower(regexp_replace(split_part(u.email, '@', 1), '[^a-z0-9_]', '_', 'g')) as username
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username is null
)
update public.profiles p
set username = c.username
from candidates c
where p.id = c.id
  and not exists (
    select 1 from public.profiles other
    where other.username = c.username and other.id <> p.id
  );
