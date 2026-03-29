import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
      fetchGameHistory();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/game/history');
      setGameHistory(res.data);
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-danger mb-4">Access Denied</h2>
          <p className="text-gray-400">You do not have admin access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'users'
              ? 'bg-primary text-white'
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('game')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'game'
              ? 'bg-primary text-white'
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          }`}
        >
          Game History
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'settings'
              ? 'bg-primary text-white'
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          }`}
        >
          Settings
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">All Users ({users.length})</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-3 text-gray-400 font-medium">Phone</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Balance</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Role</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Joined</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => (
                    <tr key={index} className="border-b border-dark-700/50">
                      <td className="py-3 text-gray-300">{u.phone}</td>
                      <td className="py-3 font-mono text-accent">₣{u.balance?.toLocaleString()}</td>
                      <td className="py-3">
                        {u.isAdmin ? (
                          <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">Admin</span>
                        ) : (
                          <span className="px-2 py-1 bg-dark-700 text-gray-400 rounded text-sm">User</span>
                        )}
                      </td>
                      <td className="py-3 text-gray-400 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-gray-400 text-sm">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'game' && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Game History ({gameHistory.length} rounds)</h2>
          
          {gameHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No game history</div>
          ) : (
            <div className="space-y-2">
              {gameHistory.slice().reverse().map((round, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                  <span className="font-mono text-gray-400">
                    {new Date(round.timestamp).toLocaleString()}
                  </span>
                  <span className={`font-mono font-bold ${
                    round.multiplier < 2 ? 'text-danger' : 'text-success'
                  }`}>
                    {round.multiplier.toFixed(2)}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Game Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Waiting Time (ms)</label>
              <input
                type="number"
                defaultValue={10000}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Delay (ms)</label>
              <input
                type="number"
                defaultValue={5000}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
