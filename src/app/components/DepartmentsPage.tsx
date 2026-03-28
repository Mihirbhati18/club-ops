import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Edit, Trash2, Award, TrendingUp } from 'lucide-react';
import { apiCall } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  type: 'Technical' | 'Non-Technical';
  lead: string;
  members: string[];
  tasks: { name: string; progress: number }[];
  attendance: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [filter, setFilter] = useState<'All' | 'Technical' | 'Non-Technical'>('All');

  useEffect(() => {
    loadDepartments();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const user = await getCurrentUser();
    setUserRole(user?.role || '');
  };

  const loadDepartments = async () => {
    try {
      const response = await apiCall('/departments');
      setDepartments(response.departments || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await apiCall(`/departments/${id}`, { method: 'DELETE' });
      toast.success('Department deleted');
      loadDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  const filteredDepts = departments.filter(d => 
    filter === 'All' ? true : d.type === filter
  );

  const topContributors = departments
    .flatMap(d => d.members.map(m => ({ name: m, dept: d.name })))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Departments
          </h1>
          <p className="text-gray-400 mt-1">Manage your club departments and teams</p>
        </div>
        {userRole === 'Admin' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Add Department</span>
          </motion.button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['All', 'Technical', 'Non-Technical'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === type
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Total Departments</h3>
          </div>
          <p className="text-3xl font-bold text-white">{departments.length}</p>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-xl border border-pink-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Total Members</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {departments.reduce((sum, d) => sum + d.members.length, 0)}
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Avg Attendance</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {departments.length > 0
              ? Math.round(departments.reduce((sum, d) => sum + d.attendance, 0) / departments.length)
              : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Departments List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading departments...</div>
          ) : filteredDepts.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-xl">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No departments found</p>
            </div>
          ) : (
            filteredDepts.map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{dept.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dept.type === 'Technical' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-pink-500/20 text-pink-400'
                      }`}>
                        {dept.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Lead: <span className="text-white font-medium">{dept.lead}</span></p>
                  </div>

                  {userRole === 'Admin' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingDept(dept)}
                        className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Members</p>
                    <p className="text-2xl font-bold text-white">{dept.members.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Attendance</p>
                    <p className="text-2xl font-bold text-white">{dept.attendance}%</p>
                  </div>
                </div>

                {/* Tasks Progress */}
                {dept.tasks && dept.tasks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-medium">Active Tasks</p>
                    {dept.tasks.map((task, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">{task.name}</span>
                          <span className="text-gray-400 text-xs">{task.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Members List */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-gray-400 text-sm font-medium mb-2">Team Members</p>
                  <div className="flex flex-wrap gap-2">
                    {dept.members.map((member, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-full text-sm"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Leaderboard Sidebar */}
        <div className="space-y-4">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Top Contributors</h3>
            </div>

            <div className="space-y-3">
              {topContributors.map((contributor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{contributor.name}</p>
                    <p className="text-gray-400 text-xs">{contributor.dept}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingDept) && (
        <DepartmentModal
          department={editingDept}
          onClose={() => {
            setShowAddModal(false);
            setEditingDept(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingDept(null);
            loadDepartments();
          }}
        />
      )}
    </div>
  );
}

function DepartmentModal({ 
  department, 
  onClose, 
  onSave 
}: { 
  department: Department | null; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    type: department?.type || 'Technical',
    lead: department?.lead || '',
    members: department?.members.join(', ') || '',
    attendance: department?.attendance || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        lead: formData.lead,
        members: formData.members.split(',').map(m => m.trim()).filter(Boolean),
        attendance: formData.attendance,
        tasks: department?.tasks || [],
      };

      if (department) {
        await apiCall(`/departments/${department.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Department updated');
      } else {
        await apiCall('/departments', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Department created');
      }

      onSave();
    } catch (error) {
      toast.error('Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-purple-500/20 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {department ? 'Edit Department' : 'Add Department'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Department Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Technical">Technical</option>
              <option value="Non-Technical">Non-Technical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lead
            </label>
            <input
              type="text"
              value={formData.lead}
              onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Members (comma separated)
            </label>
            <textarea
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="John Doe, Jane Smith, ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attendance (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.attendance}
              onChange={(e) => setFormData({ ...formData, attendance: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
