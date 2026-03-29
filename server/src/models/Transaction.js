const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw', 'bet', 'win', 'cashout'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  reference: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
