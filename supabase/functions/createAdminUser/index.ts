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

  // 1. Verify Authorization header
  const authorization = req.headers.get('Authorization')
  if (!authorization) return json({ error: 'unauthorized' }, 401)

  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const emailDomain = Deno.env.get('REACT_APP_AUTH_EMAIL_DOMAIN') || Deno.env.get('AUTH_EMAIL_DOMAIN') || 'lithiooperfumes.com'

  const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } })
  const adminClient = createClient(url, serviceKey)
  const token = authorization.replace(/^Bearer\s+/i, '')
  const { data: { user: caller } } = await callerClient.auth.getUser(token)
  if (!caller) return json({ error: 'unauthorized' }, 401)

  // 2. Verify caller is an active admin in profiles table
  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('role, is_active')
    .eq('id', caller.id)
    .maybeSingle()

  if (callerProfile?.role !== 'admin' || callerProfile?.is_active !== true) {
    return json({ error: 'forbidden' }, 403)
  }

  try {
    const payload = await req.json()
    const { action = 'create', data = {} } = payload.action ? payload : { action: 'create', data: payload }

    if (action === 'create') {
      const username = String(data.username || '').trim().toLowerCase()
      const password = String(data.password || '')
      const role = String(data.role || 'staff')
      const fullName = String(data.full_name || data.fullName || username)
      const phone = String(data.phone || '')

      if (!usernamePattern.test(username) || password.length < 6 || !validRoles.has(role)) {
        return json({ error: 'invalid_input' }, 400)
      }

      const email = `${username}@${emailDomain}`

      const { data: created, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          full_name: fullName,
          phone,
          role,
        },
      })

      if (error || !created.user) {
        return json({ error: error?.message || 'create_failed' }, 400)
      }

      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: created.user.id,
          username,
          full_name: fullName,
          phone,
          role,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select('id, username, full_name, phone, role, is_active, created_at')
        .single()

      if (profileError) return json({ error: profileError.message }, 400)
      return json({ ok: true, user: profile }, 201)
    }

    // Secondary actions (update, reset_password, set_active, delete)
    const id = String(data.id || '')
    if (!id || id === caller.id) return json({ error: 'invalid_target' }, 400)

    if (action === 'update') {
      const role = String(data.role || '')
      if (!validRoles.has(role)) return json({ error: 'invalid_input' }, 400)
      const updateData: Record<string, unknown> = { role }
      if (data.full_name) updateData.full_name = data.full_name
      if (data.phone) updateData.phone = data.phone
      const { data: profile, error } = await adminClient.from('profiles').update(updateData)
        .eq('id', id).select('id, username, full_name, phone, role, is_active, created_at').single()
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true, user: profile })
    }

    if (action === 'reset_password') {
      const password = String(data.password || '')
      if (password.length < 6) return json({ error: 'invalid_password' }, 400)
      const { error } = await adminClient.auth.admin.updateUserById(id, { password })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    if (action === 'set_active') {
      const { data: profile, error } = await adminClient.from('profiles').update({ is_active: Boolean(data.is_active) })
        .eq('id', id).select('id, username, full_name, phone, role, is_active, created_at').single()
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true, user: profile })
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

