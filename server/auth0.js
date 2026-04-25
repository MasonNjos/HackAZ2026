const { auth } = require('express-oauth2-jwt-bearer');

const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL || process.env.AUTH0_ISSUER;
const audience = process.env.AUTH0_AUDIENCE;

if (!issuerBaseURL) {
  // eslint-disable-next-line no-console
  console.warn('AUTH0_ISSUER_BASE_URL is not set (Auth0 JWT validation will fail).');
}

if (!audience) {
  // eslint-disable-next-line no-console
  console.warn('AUTH0_AUDIENCE is not set (Auth0 JWT validation will fail).');
}

const checkJwt = auth({
  issuerBaseURL,
  audience,
});

module.exports = { checkJwt };

