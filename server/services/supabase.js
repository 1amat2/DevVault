'use strict';

const { createClient } = require('@supabase/supabase-js');

const url            = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — database calls will fail.');
}

/**
 * Server-side Supabase admin client.
 * Uses the service role key — bypasses RLS.
 * NEVER send this client's credentials to the browser.
 */
const supabase = createClient(url || '', serviceRoleKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession:   false,
  },
});

module.exports = supabase;
