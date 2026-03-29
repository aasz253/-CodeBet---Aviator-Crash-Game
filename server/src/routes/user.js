const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Bet = require('../models/Bet');

router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      phone: req.user.phone,
      balance: req.user.balance,
      isAdmin: req.user.isAdmin,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/bets', auth, async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(bets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const totalBets = await Bet.countDocuments({ user: req.user._id });
    const wonBets = await Bet.countDocuments({ user: req.user._id, cashedOut: true });
    const totalWinnings = await Bet.aggregate([
      { $match: { user: req.user._id, cashedOut: true } },
      { $group: { _id: null, total: { $sum: '$winnings' } } }
    ]);

    res.json({
      totalBets,
      wonBets,
      totalWinnings: totalWinnings[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/users', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
