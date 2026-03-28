import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, Plus, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiCall } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { toast } from 'sonner';

interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'paid' | 'pending';
}

export default function FinancePage() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadRecords();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const user = await getCurrentUser();
    setUserRole(user?.role || '');
  };

  const loadRecords = async () => {
    try {
      const response = await apiCall('/finance');
      setRecords(response.finance || []);
    } catch (error) {
      console.error('Failed to load finance:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpenses;
  const pendingPayments = records.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  const chartData = [
    { name: 'Jan', income: 1200, expenses: 800 },
    { name: 'Feb', income: 1500, expenses: 1000 },
    { name: 'Mar', income: 1800, expenses: 1200 },
    { name: 'Apr', income: 2000, expenses: 1500 },
    { name: 'May', income: 2200, expenses: 1800 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Finance
          </h1>
          <p className="text-gray-400 mt-1">Track income, expenses, and sponsorships</p>
        </div>
        {userRole === 'Admin' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Add Record</span>
          </motion.button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <span className="text-xs text-green-400">Income</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalIncome}</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-400" />
            <span className="text-xs text-red-400">Expenses</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalExpenses}</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-cyan-400" />
            <span className="text-xs text-cyan-400">Balance</span>
          </div>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${balance}
          </p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-orange-400" />
            <span className="text-xs text-orange-400">Pending</span>
          </div>
          <p className="text-3xl font-bold text-white">${pendingPayments}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-green-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-green-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Financial Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-green-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {loading ? (
            <p className="text-center py-8 text-gray-400">Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-center py-8 text-gray-400">No transactions yet</p>
          ) : (
            records.slice(0, 10).map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    record.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {record.type === 'income' ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{record.description}</p>
                    <p className="text-sm text-gray-400">{record.category} • {record.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${record.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {record.type === 'income' ? '+' : '-'}${record.amount}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    record.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {record.status}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <FinanceModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            loadRecords();
          }}
        />
      )}
    </div>
  );
}

function FinanceModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'paid' as 'paid' | 'pending',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall('/finance', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('Record added');
      onSave();
    } catch (error) {
      toast.error('Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-green-500/20 rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Add Finance Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
              placeholder="Sponsorship, Event, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount ($)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
