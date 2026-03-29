import React from 'react';

const BetsList = ({ bets }) => {
  if (!bets || bets.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No bets placed yet
      </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto scrollbar-thin">
      <table className="w-full">
        <thead className="text-left text-sm text-gray-400">
          <tr>
            <th className="pb-2">User</th>
            <th className="pb-2">Bet</th>
            <th className="pb-2">Cashout</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {bets.map((bet, index) => (
            <tr key={index} className="border-t border-dark-700">
              <td className="py-2 text-gray-300">
                {bet.user?.phone ? `${bet.user.phone.slice(0, 4)}***${bet.user.phone.slice(-3)}` : 'Anonymous'}
              </td>
              <td className="py-2 font-mono text-primary">
                ₣{bet.amount?.toLocaleString()}
              </td>
              <td className="py-2 font-mono">
                {bet.cashedOut ? (
                  <span className="text-success">{bet.cashoutMultiplier?.toFixed(2)}x</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </td>
              <td className="py-2">
                {bet.cashedOut ? (
                  <span className="text-success text-sm">Won ₣{bet.winnings?.toLocaleString()}</span>
                ) : (
                  <span className="text-yellow-500 text-sm">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BetsList;
