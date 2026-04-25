const express = require('express');
const router = express.Router();
const { checkJwt } = require('../auth0');

// Minimal auth-related endpoint: verifies JWT and returns token claims.
router.get('/me', checkJwt, (req, res) => {
  res.json({
    ok: true,
    claims: req.auth?.payload,
  });
});

module.exports = router;
