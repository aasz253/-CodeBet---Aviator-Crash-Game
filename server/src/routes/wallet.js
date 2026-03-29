const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user._id);
    const balanceBefore = user.balance;

    user.balance += amount;
    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount,
      balanceBefore,
      balanceAfter: user.balance,
      description: `Deposit via ${paymentMethod || 'M-Pesa'}`
    });

    res.json({
      message: 'Deposit successful',
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, mpesaPhone } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user._id);

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const balanceBefore = user.balance;
    user.balance -= amount;
    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'withdraw',
      amount,
      balanceBefore,
      balanceAfter: user.balance,
      reference: `WD${Date.now()}`,
      description: `Withdrawal to ${mpesaPhone || 'M-Pesa'} - Pending approval`
    });

    res.json({
      message: 'Withdrawal request submitted',
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
