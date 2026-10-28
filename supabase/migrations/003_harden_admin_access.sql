-- Removes the legacy browser-based administrator registry and prevents it
-- from ever being exposed through the public settings endpoint.
delete from public.site_settings where key = 'admin_accounts_registry';

drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings
  for select to anon, authenticated
  using (is_public and key <> 'admin_accounts_registry');
