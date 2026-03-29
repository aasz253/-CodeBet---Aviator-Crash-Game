import React from 'react';

const BettingPanel = ({ 
  betAmount, 
  setBetAmount, 
  autoCashout, 
  setAutoCashout, 
  canBet, 
  canCashOut,
  myBet,
  onPlaceBet,
  onCashOut,
  betting,
  cashingOut,
  balance,
  currentMultiplier
}) => {
  const quickBetAmounts = [100, 500, 1000, 5000];

  return (
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
                KSh {amount}
              </button>
            ))}
            <button
              onClick={() => setBetAmount(balance)}
              disabled={!canBet}
              className={`px-3 py-1 rounded text-sm font-mono ${
                canBet 
                  ? 'bg-dark-700 hover:bg-primary/20 text-gray-300 hover:text-primary transition-colors' 
                  : 'bg-dark-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              MAX
            </button>
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
              KSh {myBet.amount?.toLocaleString()}
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

        {canBet && (
          <button
            onClick={onPlaceBet}
            disabled={betting || betAmount <= 0 || betAmount > balance}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {betting ? 'Placing Bet...' : `Place Bet KSh ${betAmount}`}
          </button>
        )}

        {canCashOut && (
          <button
            onClick={onCashOut}
            disabled={cashingOut}
            className="w-full bg-gradient-to-r from-success to-green-600 hover:from-success/80 hover:to-green-600/80 text-white font-semibold py-4 rounded-lg transition-all animate-pulse"
          >
            {cashingOut ? 'Cashing Out...' : `Cash Out @ ${currentMultiplier.toFixed(2)}x`}
          </button>
        )}

        {myBet && !canBet && !canCashOut && (
          <div className="text-center text-gray-400 py-2">
            Wait for next round to place a new bet
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingPanel;
