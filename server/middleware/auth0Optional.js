/**
 * Optional Auth0 JWT enforcement scaffold.
 *
 * MVP default: disabled (AUTH_REQUIRED=false) so hackathon flow works without Auth0 setup.
 * When enabled: expects an Authorization: Bearer <token> header and will attach req.auth.
 */

function optionalAuth0() {
  const authRequired = String(process.env.AUTH_REQUIRED || 'false').toLowerCase() === 'true';

  return async function auth0Middleware(req, res, next) {
    if (!authRequired) return next();

    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ error: { message: 'Missing Bearer token' } });
    }

    // Placeholder: verify JWT with Auth0 JWKS here (later).
    // For now, treat token as opaque and fail closed to avoid a false sense of security.
    return res.status(501).json({
      error: {
        message: 'Auth0 JWT verification not implemented yet',
        details: 'Set AUTH_REQUIRED=false for MVP, or implement JWKS verification.',
      },
    });
  };
}

module.exports = { optionalAuth0 };
