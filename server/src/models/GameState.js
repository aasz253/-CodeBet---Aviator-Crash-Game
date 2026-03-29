const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  multiplier: Number,
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const gameStateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['waiting', 'flying', 'crashed'],
    default: 'waiting'
  },
  currentMultiplier: {
    type: Number,
    default: 1.0
  },
  crashPoint: {
    type: Number,
    default: null
  },
  roundId: {
    type: String,
    default: null
  },
  history: {
    type: [historySchema],
    default: []
  },
  roundStartTime: {
    type: Date,
    default: null
  },
  waitingTime: {
    type: Number,
    default: 10000
  },
  gameDelay: {
    type: Number,
    default: 5000
  }
});

module.exports = mongoose.model('GameState', gameStateSchema);
