const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roundId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  autoCashoutAt: {
    type: Number,
    default: null
  },
  cashedOut: {
    type: Boolean,
    default: false
  },
  cashoutMultiplier: {
    type: Number,
    default: null
  },
  winnings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

betSchema.index({ user: 1, roundId: 1 });

module.exports = mongoose.model('Bet', betSchema);
