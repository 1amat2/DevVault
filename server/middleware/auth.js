'use strict';

const { createClient } = require('@supabase/supabase-js');

// Anon-key client — only used to verify JWT tokens from the browser
const supabaseAuth = createClient(
  process.env.SUPABASE_URL  || '',
  process.env.SUPABASE_ANON_KEY || ''
);

/**
 * Middleware: verifies the Supabase JWT in Authorization: Bearer <token>
 * Attaches req.user = { id, email, ... } on success.
 */
module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized — no token provided.' });
  }

  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token.' });
  }

  req.user = user;
  next();
};
