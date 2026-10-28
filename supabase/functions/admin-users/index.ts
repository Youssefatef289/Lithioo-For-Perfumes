import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const validRoles = new Set(['admin', 'manager', 'staff'])
const usernamePattern = /^[a-z0-9_]{3,30}$/

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authorization = req.headers.get('Authorization')
  if (!authorization) return json({ error: 'unauthorized' }, 401)

  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } })
  const adminClient = createClient(url, serviceKey)
  const token = authorization.replace(/^Bearer\s+/i, '')
  const { data: { user: caller } } = await callerClient.auth.getUser(token)
  if (!caller) return json({ error: 'unauthorized' }, 401)

  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('role, is_active')
    .eq('id', caller.id)
    .maybeSingle()
  if (callerProfile?.role !== 'admin' || callerProfile.is_active !== true) {
    return json({ error: 'forbidden' }, 403)
  }

  try {
    const { action, data = {} } = await req.json()
    if (action === 'create') {
      const username = String(data.username || '').trim().toLowerCase()
      const password = String(data.password || '')
      const role = String(data.role || 'staff')
      if (!usernamePattern.test(username) || password.length < 8 || !validRoles.has(role)) {
        return json({ error: 'invalid_input' }, 400)
      }
      const { data: created, error } = await adminClient.auth.admin.createUser({
        email: `${username}@lithioo.app`, password, email_confirm: true,
        user_metadata: { username, full_name: String(data.full_name || username), phone: String(data.phone || ''), role },
      })
      if (error || !created.user) return json({ error: error?.message || 'create_failed' }, 400)
      const { data: profile, error: profileError } = await adminClient.from('profiles').update({
        full_name: String(data.full_name || username), username, phone: String(data.phone || ''), role, is_active: true,
      }).eq('id', created.user.id).select('id, full_name, username, phone, role, is_active, created_at').single()
      if (profileError) return json({ error: profileError.message }, 400)
      return json({ user: profile }, 201)
    }

    const id = String(data.id || '')
    if (!id || id === caller.id) return json({ error: 'invalid_target' }, 400)
    if (action === 'update') {
      const role = String(data.role || '')
      if (!validRoles.has(role)) return json({ error: 'invalid_input' }, 400)
      const { data: profile, error } = await adminClient.from('profiles').update({
        full_name: String(data.full_name || ''), phone: String(data.phone || ''), role,
      }).eq('id', id).select('id, full_name, username, phone, role, is_active, created_at').single()
      if (error) return json({ error: error.message }, 400)
      return json({ user: profile })
    }
    if (action === 'reset_password') {
      const password = String(data.password || '')
      if (password.length < 8) return json({ error: 'invalid_password' }, 400)
      const { error } = await adminClient.auth.admin.updateUserById(id, { password })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }
    if (action === 'set_active') {
      const { data: profile, error } = await adminClient.from('profiles').update({ is_active: Boolean(data.is_active) })
        .eq('id', id).select('id, full_name, username, phone, role, is_active, created_at').single()
      if (error) return json({ error: error.message }, 400)
      return json({ user: profile })
    }
    if (action === 'delete') {
      const { error } = await adminClient.auth.admin.deleteUser(id)
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }
    return json({ error: 'unknown_action' }, 400)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'server_error' }, 500)
  }
})
