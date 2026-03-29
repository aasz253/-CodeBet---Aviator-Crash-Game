import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const App = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roundCount, setRoundCount] = useState(50);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/game/history');
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayHistory = history.slice(-roundCount);

  const calculateStats = () => {
    if (displayHistory.length === 0) return null;

    const multipliers = displayHistory.map(h => h.multiplier);
    const avg = multipliers.reduce((a, b) => a + b, 0) / multipliers.length;
    
    const below2 = multipliers.filter(m => m < 2).length;
    const below10 = multipliers.filter(m => m < 10).length;
    const above10 = multipliers.filter(m => m >= 10).length;
    
    const variance = multipliers.reduce((acc, m) => acc + Math.pow(m - avg, 2), 0) / multipliers.length;
    const stdDev = Math.sqrt(variance);
    
    let streak = 0;
    let currentDir = null;
    for (let i = 1; i < multipliers.length; i++) {
      const dir = multipliers[i] < multipliers[i-1] ? 'down' : 'up';
      if (currentDir === null) {
        currentDir = dir;
        streak = 1;
      } else if (dir === currentDir) {
        streak++;
      } else {
        streak = 1;
        currentDir = dir;
      }
    }

    const lowMultiplierStreak = multipliers.slice(-5).filter(m => m < 2).length;
    const highMultiplierStreak = multipliers.slice(-5).filter(m => m > 10).length;

    return {
      avg: avg.toFixed(2),
      below2: below2,
      below2Percent: ((below2 / multipliers.length) * 100).toFixed(1),
      below10: below10,
      above10: above10,
      stdDev: stdDev.toFixed(2),
      streak: streak,
      volatility: stdDev > avg ? 'High' : stdDev > avg * 0.5 ? 'Medium' : 'Low',
      insight: getInsight(lowMultiplierStreak, highMultiplierStreak, avg, stdDev)
    };
  };

  const getInsight = (low, high, avg, stdDev) => {
    const insights = [];
    
    if (low >= 4) {
      insights.push('🔴 Low multiplier streak detected - averages below 2x');
    }
    if (high >= 3) {
      insights.push('🟢 High multiplier streak ongoing - crash points above 10x');
    }
    if (stdDev > avg) {
      insights.push('⚡ High volatility detected');
    } else if (stdDev < avg * 0.3) {
      insights.push('📉 Low volatility - more predictable outcomes');
    }
    if (avg > 5) {
      insights.push('📊 Above average multiplier this session');
    }
    
    if (insights.length === 0) {
      insights.push('📊 Normal distribution - no significant patterns');
    }
    
    return insights;
  };

  const stats = calculateStats();

  const lineChartData = {
    labels: displayHistory.map((_, i) => i + 1),
    datasets: [
      {
        label: 'Multiplier',
        data: displayHistory.map(h => h.multiplier),
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: displayHistory.map(h => 
          h.multiplier < 2 ? '#ef4444' : h.multiplier > 10 ? '#22c55e' : '#6366f1'
        ),
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  const distributionData = {
    labels: ['<2x', '2-5x', '5-10x', '10-50x', '50x+'],
    datasets: [
      {
        label: 'Distribution',
        data: stats ? [
          stats.below2,
          displayHistory.filter(h => h.multiplier >= 2 && h.multiplier < 5).length,
          displayHistory.filter(h => h.multiplier >= 5 && h.multiplier < 10).length,
          displayHistory.filter(h => h.multiplier >= 10 && h.multiplier < 50).length,
          displayHistory.filter(h => h.multiplier >= 50).length,
        ] : [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(6, 182, 212, 0.8)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">CodeBet Analytics</h1>
            <p className="text-gray-400 mt-1">Statistical insights (NOT predictions)</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={roundCount}
              onChange={(e) => setRoundCount(parseInt(e.target.value))}
              className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={20}>Last 20 rounds</option>
              <option value={50}>Last 50 rounds</option>
              <option value={100}>Last 100 rounds</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading analytics...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Average Multiplier</div>
                <div className="text-2xl font-bold text-primary font-mono">
                  {stats?.avg || '0'}x
                </div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Low Multipliers (&lt;2x)</div>
                <div className="text-2xl font-bold text-danger font-mono">
                  {stats?.below2 || 0}
                  <span className="text-sm text-gray-400 ml-2">
                    ({stats?.below2Percent || 0}%)
                  </span>
                </div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Volatility</div>
                <div className={`text-2xl font-bold font-mono ${
                  stats?.volatility === 'High' ? 'text-danger' : 
                  stats?.volatility === 'Medium' ? 'text-yellow-500' : 'text-success'
                }`}>
                  {stats?.volatility || 'N/A'}
                </div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Std Deviation</div>
                <div className="text-2xl font-bold text-accent font-mono">
                  {stats?.stdDev || '0'}
                </div>
              </div>
            </div>

            {stats?.insight && (
              <div className="glass rounded-xl p-4 mb-8">
                <h3 className="text-lg font-semibold mb-3">📊 Insights</h3>
                <div className="space-y-2">
                  {stats.insight.map((insight, i) => (
                    <div key={i} className="text-gray-300">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Multiplier Trend</h3>
                <div className="h-64">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Distribution</h3>
                <div className="h-64">
                  <Bar data={distributionData} options={distributionOptions} />
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Multipliers</h3>
              <div className="flex flex-wrap gap-2">
                {displayHistory.slice().reverse().map((item, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-lg font-mono ${
                      item.multiplier < 2
                        ? 'bg-danger/20 text-danger'
                        : item.multiplier < 10
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-success/20 text-success'
                    }`}
                  >
                    {item.multiplier.toFixed(2)}x
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>⚠️ This dashboard shows historical data and statistics only.</p>
              <p>Past performance does not guarantee future results. This is for educational purposes only.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
