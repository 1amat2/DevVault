'use strict';

/**
 * Global Express error handler.
 * Must be the last middleware registered in server.js.
 * eslint-disable-next-line no-unused-vars
 */
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  // Log full error server-side
  console.error(`[error] ${req.method} ${req.path} —`, err.message || err);

  // Supabase / PostgREST errors come with a .code field
  if (err.code === 'PGRST116') {
    return res.status(404).json({ error: 'Resource not found.' });
  }

  // Validation errors we throw manually with a .status
  const status = err.status || err.statusCode || 500;

  // In production don't leak stack traces
  const message = process.env.NODE_ENV === 'production'
    ? (status < 500 ? err.message : 'Internal server error.')
    : (err.message || 'Internal server error.');

  res.status(status).json({ error: message });
};
