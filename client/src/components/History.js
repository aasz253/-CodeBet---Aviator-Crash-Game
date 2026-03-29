import React from 'react';

const History = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No history yet
      </div>
    );
  }

  const recentHistory = history.slice(-15).reverse();

  return (
    <div className="flex flex-wrap gap-2">
      {recentHistory.map((item, index) => (
        <div
          key={index}
          className={`px-3 py-1.5 rounded font-mono text-sm ${
            item.multiplier < 2
              ? 'bg-danger/20 text-danger'
              : item.multiplier < 10
              ? 'bg-success/20 text-success'
              : 'bg-accent/20 text-accent'
          }`}
        >
          {item.multiplier.toFixed(2)}x
        </div>
      ))}
    </div>
  );
};

export default History;
