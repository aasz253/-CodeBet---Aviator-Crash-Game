import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import GameCanvas from '../components/GameCanvas';
import BettingPanel from '../components/BettingPanel';
import History from '../components/History';
import BetsList from '../components/BetsList';

const Game = () => {
  const { gameState, myBet, placeBet, cashOut, connected } = useGame();
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState(100);
  const [autoCashout, setAutoCashout] = useState('');
  const [betting, setBetting] = useState(false);
  const [cashingOut, setCashingOut] = useState(false);
  const [message, setMessage] = useState('');
  const [lastWinnings, setLastWinnings] = useState(null);

  const canBet = gameState.status === 'waiting' && !myBet;
  const canCashOut = gameState.status === 'flying' && myBet && !myBet.cashedOut;

  const handlePlaceBet = async () => {
    if (!canBet) return;
    setBetting(true);
    setMessage('');

    try {
      const autoCashoutValue = autoCashout ? parseFloat(autoCashout) : null;
      await placeBet(betAmount, autoCashoutValue);
      setMessage('Bet placed successfully!');
    } catch (error) {
      setMessage(error);
    } finally {
      setBetting(false);
    }
  };

  const handleCashOut = async () => {
    if (!canCashOut) return;
    setCashingOut(true);
    setMessage('');

    try {
      const result = await cashOut();
      setLastWinnings(result.winnings);
      setMessage(`Cashout at ${gameState.currentMultiplier.toFixed(2)}x! You won ₣${result.winnings.toLocaleString()}`);
    } catch (error) {
      setMessage(error);
    } finally {
      setCashingOut(false);
    }
  };

  const quickBetAmounts = [100, 500, 1000, 5000];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  gameState.status === 'waiting' 
                    ? 'bg-yellow-500/20 text-yellow-500' 
                    : gameState.status === 'flying'
                    ? 'bg-success/20 text-success'
                    : 'bg-danger/20 text-danger'
                }`}>
                  {gameState.status === 'waiting' && '⏳ Waiting'}
                  {gameState.status === 'flying' && '✈️ Flying'}
                  {gameState.status === 'crashed' && '💥 Crashed'}
                </span>
                {gameState.roundId && (
                  <span className="text-gray-400 text-sm">
                    Round: <span className="font-mono text-white">{gameState.roundId}</span>
                  </span>
                )}
              </div>
              <div className={`flex items-center space-x-2 ${connected ? 'text-success' : 'text-danger'}`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-danger'}`}></div>
                <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>

            <div className="relative">
              <GameCanvas 
                multiplier={gameState.currentMultiplier} 
                status={gameState.status}
              />
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className={`text-6xl md:text-8xl font-bold font-mono ${
                  gameState.status === 'crashed' 
                    ? 'neon-red text-danger' 
                    : gameState.status === 'flying'
                    ? 'neon-green text-success'
                    : 'neon-text text-primary'
                }`}>
                  {gameState.currentMultiplier.toFixed(2)}x
                </div>
                {gameState.status === 'crashed' && lastWinnings && (
                  <div className="mt-4 text-white text-xl animate-pulse">
                    Last win: ₣{lastWinnings.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="text-lg font-semibold mb-4">Live Bets</h3>
            <BetsList bets={gameState.bets || []} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Place Bet</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bet Amount</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!canBet}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickBetAmounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      disabled={!canBet}
                      className={`px-3 py-1 rounded text-sm font-mono ${
                        canBet 
                          ? 'bg-dark-700 hover:bg-primary/20 text-gray-300 hover:text-primary transition-colors' 
                          : 'bg-dark-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      ₣{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Auto Cashout (optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(e.target.value)}
                  placeholder="e.g. 2.0"
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!canBet}
                />
              </div>

              {myBet && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Your Bet</div>
                  <div className="text-2xl font-bold text-primary font-mono">
                    ₣{myBet.amount?.toLocaleString()}
                  </div>
                  {myBet.autoCashoutAt && (
                    <div className="text-sm text-gray-400 mt-1">
                      Auto cashout at {myBet.autoCashoutAt}x
                    </div>
                  )}
                  {myBet.cashedOut && (
                    <div className="text-success mt-2 font-semibold">
                      ✓ Cashed out at {myBet.cashoutMultiplier}x
                    </div>
                  )}
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('won') || message.includes('successfully')
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger'
                }`}>
                  {message}
                </div>
              )}

              {canBet && (
                <button
                  onClick={handlePlaceBet}
                  disabled={betting || betAmount <= 0 || betAmount > user?.balance}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {betting ? 'Placing Bet...' : `Place Bet ₣${betAmount}`}
                </button>
              )}

              {canCashOut && (
                <button
                  onClick={handleCashOut}
                  disabled={cashingOut}
                  className="w-full bg-gradient-to-r from-success to-green-600 hover:from-success/80 hover:to-green-600/80 text-white font-semibold py-4 rounded-lg transition-all animate-pulse"
                >
                  {cashingOut ? 'Cashing Out...' : `Cash Out @ ${gameState.currentMultiplier.toFixed(2)}x`}
                </button>
              )}

              {gameState.status === 'waiting' && myBet && (
                <div className="text-center text-gray-400 py-2">
                  Wait for next round to place a new bet
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="text-lg font-semibold mb-4">Your Balance</h3>
            <div className="text-3xl font-bold text-accent font-mono">
              ₣{user?.balance?.toLocaleString() || 0}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {canBet ? 'Ready to bet' : 'Waiting for next round'}
            </p>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="text-lg font-semibold mb-4">Recent History</h3>
            <History history={gameState.history || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
