const GameState = require('../models/GameState');
const Bet = require('../models/Bet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

let gameLoopInterval = null;
let multiplierInterval = null;

const generateCrashPoint = () => {
  const r = Math.random();
  const crashPoint = Math.min(2000, Math.floor((100 / (1 - r))) / 100);
  return Math.max(1.0, crashPoint);
};

const startGameLoop = (io) => {
  const gameLoop = async () => {
    try {
      const gameState = await GameState.findOne();
      
      if (gameState.status === 'waiting') {
        await startFlyingPhase(gameState, io);
      }
    } catch (error) {
      console.error('Game loop error:', error);
    }
  };

  gameLoopInterval = setInterval(gameLoop, 1000);
  console.log('Game loop initialized');
};

const startFlyingPhase = async (gameState, io) => {
  const roundId = uuidv4().slice(0, 8).toUpperCase();
  const crashPoint = generateCrashPoint();
  
  gameState.status = 'flying';
  gameState.roundId = roundId;
  gameState.crashPoint = crashPoint;
  gameState.currentMultiplier = 1.0;
  gameState.roundStartTime = new Date();
  await gameState.save();

  io.emit('gameStart', {
    roundId,
    crashPoint,
    status: 'flying',
    startTime: gameState.roundStartTime
  });

  const startTime = Date.now();
  const baseInterval = 100;
  
  const updateMultiplier = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const newMultiplier = Math.pow(1.008, elapsed * 10);
    
    if (newMultiplier >= crashPoint || gameState.status === 'crashed') {
      clearInterval(multiplierInterval);
      endRound(gameState, io, crashPoint);
      return;
    }

    gameState.currentMultiplier = newMultiplier;
    io.emit('multiplierUpdate', {
      multiplier: newMultiplier,
      status: 'flying'
    });
  };

  multiplierInterval = setInterval(updateMultiplier, baseInterval);
};

const endRound = async (gameState, io, finalMultiplier) => {
  clearInterval(multiplierInterval);
  
  gameState.status = 'crashed';
  gameState.currentMultiplier = finalMultiplier;
  await gameState.save();

  io.emit('gameCrash', {
    multiplier: finalMultiplier,
    roundId: gameState.roundId,
    status: 'crashed'
  });

  const bets = await Bet.find({
    roundId: gameState.roundId,
    cashedOut: false
  });

  for (const bet of bets) {
    try {
      const user = await User.findById(bet.user);
      if (user) {
        await Transaction.create({
          user: bet.user,
          type: 'bet',
          amount: bet.amount,
          balanceBefore: user.balance,
          balanceAfter: user.balance,
          reference: gameState.roundId,
          description: `Bet lost - crashed at ${finalMultiplier.toFixed(2)}x`
        });
      }
    } catch (error) {
      console.error('Error processing lost bet:', error);
    }
  }

  gameState.history.push({
    multiplier: finalMultiplier,
    timestamp: new Date()
  });

  if (gameState.history.length > 100) {
    gameState.history = gameState.history.slice(-100);
  }

  await gameState.save();

  await new Promise(resolve => setTimeout(resolve, 3000));

  gameState.status = 'waiting';
  gameState.currentMultiplier = 1.0;
  gameState.crashPoint = null;
  gameState.roundId = null;
  gameState.roundStartTime = null;
  await gameState.save();

  io.emit('gameWaiting', {
    status: 'waiting',
    nextRoundId: null
  });
};

const processAutoCashouts = async (io, currentMultiplier) => {
  try {
    const gameState = await GameState.findOne();
    if (!gameState) return;

    const autoCashoutBets = await Bet.find({
      roundId: gameState.roundId,
      cashedOut: false,
      autoCashoutAt: { $lte: currentMultiplier }
    });

    for (const bet of autoCashoutBets) {
      try {
        const user = await User.findById(bet.user);
        if (!user) continue;

        const winnings = Math.floor(bet.amount * bet.autoCashoutAt);
        
        user.balance += winnings;
        await user.save();

        bet.cashedOut = true;
        bet.cashoutMultiplier = bet.autoCashoutAt;
        bet.winnings = winnings;
        await bet.save();

        await Transaction.create({
          user: bet.user,
          type: 'cashout',
          amount: winnings,
          balanceBefore: user.balance - winnings,
          balanceAfter: user.balance,
          reference: gameState.roundId,
          description: `Auto cashout at ${bet.autoCashoutAt}x`
        });

        io.to(bet.user.toString()).emit('autoCashout', {
          multiplier: bet.autoCashoutAt,
          winnings
        });
      } catch (error) {
        console.error('Auto cashout error:', error);
      }
    }
  } catch (error) {
    console.error('Process auto cashouts error:', error);
  }
};

module.exports = {
  startGameLoop,
  generateCrashPoint
};
