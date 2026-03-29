const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

router.post('/register', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Please provide phone and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const user = new User({
      phone,
      password,
      balance: 10000
    });

    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount: 10000,
      balanceBefore: 0,
      balanceAfter: 10000,
      description: 'Welcome bonus'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        balance: user.balance,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Please provide phone and password' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        balance: user.balance,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
