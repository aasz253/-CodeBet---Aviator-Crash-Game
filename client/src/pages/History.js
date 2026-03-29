import React, { useState, useEffect } from 'react';
import axios from 'axios';

const History = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchBets();
    fetchStats();
  }, []);

  const fetchBets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/bets');
      setBets(res.data);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Bets</h3>
          <div className="text-3xl font-bold text-white font-mono">
            {stats?.totalBets || 0}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Won Bets</h3>
          <div className="text-3xl font-bold text-success font-mono">
            {stats?.wonBets || 0}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Winnings</h3>
          <div className="text-3xl font-bold text-accent font-mono">
            ₣{stats?.totalWinnings?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-6">Bet History</h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : bets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No bets yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 text-gray-400 font-medium">Round</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Bet Amount</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Cashout</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Winnings</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet, index) => (
                  <tr key={index} className="border-b border-dark-700/50">
                    <td className="py-3 font-mono text-gray-300">{bet.roundId}</td>
                    <td className="py-3 font-mono text-primary">₣{bet.amount?.toLocaleString()}</td>
                    <td className="py-3 font-mono">
                      {bet.cashedOut ? (
                        <span className="text-success">{bet.cashoutMultiplier?.toFixed(2)}x</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 font-mono">
                      {bet.cashedOut ? (
                        <span className="text-success">₣{bet.winnings?.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      {bet.cashedOut ? (
                        <span className="px-2 py-1 bg-success/20 text-success rounded text-sm">Won</span>
                      ) : (
                        <span className="px-2 py-1 bg-danger/20 text-danger rounded text-sm">Lost</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-400 text-sm">
                      {new Date(bet.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
