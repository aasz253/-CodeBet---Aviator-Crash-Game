const jwt = require('jsonwebtoken');
const GameState = require('../models/GameState');
const Bet = require('../models/Bet');

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.join(socket.userId);

    try {
      const gameState = await GameState.findOne();
      socket.emit('gameState', {
        status: gameState?.status || 'waiting',
        currentMultiplier: gameState?.currentMultiplier || 1.0,
        roundId: gameState?.roundId || null,
        history: gameState?.history?.slice(-15) || []
      });

      const bets = await Bet.find({ roundId: gameState?.roundId })
        .populate('user', 'phone')
        .sort({ createdAt: -1 });
      socket.emit('roundBets', bets);
    } catch (error) {
      console.error('Socket connection error:', error);
    }

    socket.on('placeBet', async (data) => {
      try {
        const gameState = await GameState.findOne();
        if (gameState?.status !== 'waiting') {
          socket.emit('betError', { message: 'Betting is closed' });
          return;
        }

        socket.emit('betPlaced', { 
          success: true, 
          roundId: gameState?.roundId 
        });
      } catch (error) {
        socket.emit('betError', { message: 'Error placing bet' });
      }
    });

    socket.on('cashOut', async (data) => {
      try {
        socket.emit('cashOutResult', { 
          success: true 
        });
      } catch (error) {
        socket.emit('cashOutError', { message: 'Error processing cashout' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = { setupSocket };
