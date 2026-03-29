import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Wallet = () => {
  const { user, updateBalance } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [stkLoading, setStkLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/wallet/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage('');

    try {
      const amount = parseInt(depositAmount);
      if (amount <= 0) {
        setMessage('Invalid amount');
        return;
      }

      setStkLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await axios.post('http://localhost:5000/api/wallet/deposit', {
        amount,
        paymentMethod: 'M-Pesa STK Push'
      });

      updateBalance(res.data.balance);
      setMessage('Deposit successful!');
      setDepositAmount('');
      setShowDepositModal(false);
      fetchTransactions();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Deposit failed');
    } finally {
      setProcessing(false);
      setStkLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage('');

    try {
      const amount = parseInt(withdrawAmount);
      if (amount <= 0) {
        setMessage('Invalid amount');
        return;
      }

      if (amount < 100) {
        setMessage('Minimum withdrawal is ₣100');
        return;
      }

      const res = await axios.post('http://localhost:5000/api/wallet/withdraw', {
        amount,
        mpesaPhone: phone
      });

      updateBalance(res.data.balance);
      setMessage('Withdrawal request submitted!');
      setWithdrawAmount('');
      setPhone('');
      setShowWithdrawModal(false);
      fetchTransactions();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdraw':
        return '💸';
      case 'bet':
        return '🎯';
      case 'cashout':
        return '✅';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'cashout':
        return 'text-success';
      case 'withdraw':
      case 'bet':
        return 'text-danger';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-gray-400 text-sm mb-2">Available Balance</h3>
          <div className="text-3xl font-bold text-accent font-mono">
            ₣{user?.balance?.toLocaleString() || 0}
          </div>
        </div>

        <button
          onClick={() => setShowDepositModal(true)}
          className="glass rounded-2xl p-6 hover:bg-dark-700/50 transition-colors text-left"
        >
          <h3 className="text-gray-400 text-sm mb-2">Deposit</h3>
          <div className="text-2xl font-semibold text-success">+ Add Funds</div>
        </button>

        <button
          onClick={() => setShowWithdrawModal(true)}
          className="glass rounded-2xl p-6 hover:bg-dark-700/50 transition-colors text-left"
        >
          <h3 className="text-gray-400 text-sm mb-2">Withdraw</h3>
          <div className="text-2xl font-semibold text-danger">- Withdraw</div>
        </button>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-6">Transaction History</h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions yet</div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getTransactionIcon(tx.type)}</span>
                  <div>
                    <div className="font-medium text-white capitalize">{tx.type}</div>
                    <div className="text-sm text-gray-400">{tx.description}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={`font-mono font-semibold ${getTransactionColor(tx.type)}`}>
                  {tx.type === 'deposit' || tx.type === 'cashout' ? '+' : '-'}
                  ₣{tx.amount?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Deposit Funds</h3>
            
            {message && (
              <div className={`p-3 rounded-lg mb-4 ${message.includes('successful') ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {message}
              </div>
            )}

            <div className="bg-dark-800 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">💳 M-Pesa Payment</h4>
              <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                <li>Open M-Pesa on your phone</li>
                <li>Select Lipa na M-Pesa</li>
                <li>Enter Paybill: <span className="text-white font-mono">123456</span></li>
                <li>Enter Account: <span className="text-white font-mono">CODEBET</span></li>
                <li>Enter amount and confirm</li>
              </ol>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-success hover:bg-success/80 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Withdraw Funds</h3>
            
            {message && (
              <div className={`p-3 rounded-lg mb-4 ${message.includes('submitted') ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="254712345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount (Min: ₣100)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-500">
                ⚠️ Withdrawals require manual approval and may take 24-48 hours.
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-danger hover:bg-danger/80 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
