const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const GameState = require('../models/GameState');
const Bet = require('../models/Bet');

router.get('/state', async (req, res) => {
  try {
    const gameState = await GameState.findOne();
    if (!gameState) {
      return res.json({
        status: 'waiting',
        currentMultiplier: 1.0,
        history: []
      });
    }

    res.json({
      status: gameState.status,
      currentMultiplier: gameState.currentMultiplier,
      crashPoint: gameState.crashPoint,
      roundId: gameState.roundId,
      history: gameState.history.slice(-15),
      roundStartTime: gameState.roundStartTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const gameState = await GameState.findOne();
    const history = gameState?.history?.slice(-50) || [];
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/bet', auth, async (req, res) => {
  try {
    const { amount, autoCashout } = req.body;
    const gameState = await GameState.findOne();

    if (gameState.status !== 'waiting') {
      return res.status(400).json({ message: 'Betting is closed for this round' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid bet amount' });
    }

    const user = await User.findById(req.user._id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const existingBet = await Bet.findOne({
      user: req.user._id,
      roundId: gameState.roundId
    });

    if (existingBet) {
      return res.status(400).json({ message: 'You already have a bet in this round' });
    }

    user.balance -= amount;
    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'bet',
      amount,
      balanceBefore: user.balance + amount,
      balanceAfter: user.balance,
      reference: gameState.roundId,
      description: `Bet placed for round ${gameState.roundId}`
    });

    const bet = new Bet({
      user: req.user._id,
      roundId: gameState.roundId,
      amount,
      autoCashoutAt: autoCashout || null
    });

    await bet.save();

    res.json({
      message: 'Bet placed successfully',
      bet: {
        id: bet._id,
        amount: bet.amount,
        autoCashoutAt: bet.autoCashoutAt
      },
      balance: user.balance
    });
  } catch (error) {
    console.error('Bet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/cashout', auth, async (req, res) => {
  try {
    const { multiplier } = req.body;
    const gameState = await GameState.findOne();

    if (gameState.status === 'waiting') {
      return res.status(400).json({ message: 'Game has not started yet' });
    }

    if (gameState.status === 'crashed') {
      return res.status(400).json({ message: 'Game has already crashed' });
    }

    const bet = await Bet.findOne({
      user: req.user._id,
      roundId: gameState.roundId,
      cashedOut: false
    });

    if (!bet) {
      return res.status(400).json({ message: 'No active bet found' });
    }

    const winnings = Math.floor(bet.amount * multiplier);
    const user = await User.findById(req.user._id);

    user.balance += winnings;
    await user.save();

    bet.cashedOut = true;
    bet.cashoutMultiplier = multiplier;
    bet.winnings = winnings;
    await bet.save();

    await Transaction.create({
      user: user._id,
      type: 'cashout',
      amount: winnings,
      balanceBefore: user.balance - winnings,
      balanceAfter: user.balance,
      reference: gameState.roundId,
      description: `Cashout at ${multiplier}x`
    });

    res.json({
      message: 'Cashout successful',
      winnings,
      multiplier,
      balance: user.balance
    });
  } catch (error) {
    console.error('Cashout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/bets/:roundId', auth, async (req, res) => {
  try {
    const bets = await Bet.find({ roundId: req.params.roundId })
      .populate('user', 'phone')
      .sort({ createdAt: -1 });
    res.json(bets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const User = require('../models/User');
const Transaction = require('../models/Transaction');

module.exports = router;
