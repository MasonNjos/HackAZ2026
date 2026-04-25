const express = require('express');
const router = express.Router();
const { redeemCredits } = require('../services/rewards');

router.post('/', async (req, res) => {
  try {
    const userId = 1; // MVP mock user
    const { reward_type, cost } = req.body ?? {};

    const rewardType = reward_type ? String(reward_type) : 'Gas card';
    const c = cost === undefined ? 20 : Number(cost);

    const result = await redeemCredits({ userId, cost: c, rewardType });
    res.json(result);
  } catch (err) {
    if (err && err.code === 'INSUFFICIENT_BALANCE') {
      return res.status(402).json({ error: { message: err.message, details: err.details } });
    }
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

module.exports = router;
