import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Rocket, Plus, Edit, Trash2, Users, DollarSign } from 'lucide-react';
import { apiCall } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'ongoing' | 'completed';
  members: string[];
  funding: number;
  achievements?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'ongoing' | 'completed' | 'achievements'>('ongoing');

  useEffect(() => {
    loadProjects();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const user = await getCurrentUser();
    setUserRole(user?.role || '');
  };

  const loadProjects = async () => {
    try {
      const response = await apiCall('/projects');
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiCall(`/projects/${id}`, { method: 'DELETE' });
      toast.success('Project deleted');
      loadProjects();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filteredProjects = activeTab === 'achievements' 
    ? projects.filter(p => p.achievements)
    : projects.filter(p => p.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-gray-400 mt-1">Manage club projects and achievements</p>
        </div>
        {(userRole === 'Admin' || userRole === 'Member') && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Add Project</span>
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['new', 'ongoing', 'completed', 'achievements'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-xl">
            <Rocket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No projects in this category</p>
          </div>
        ) : (
          filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                    project.status === 'ongoing' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {project.status}
                  </span>
                </div>

                {userRole === 'Admin' && (
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{project.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300">Members</span>
                  </div>
                  <span className="text-white font-medium">{project.members.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300">Funding</span>
                  </div>
                  <span className="text-white font-medium">${project.funding}</span>
                </div>
              </div>

              {project.achievements && (
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Achievement</p>
                  <p className="text-sm text-green-400">{project.achievements}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-400 mb-2">Team</p>
                <div className="flex flex-wrap gap-2">
                  {project.members.slice(0, 3).map((member, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded text-xs">
                      {member}
                    </span>
                  ))}
                  {project.members.length > 3 && (
                    <span className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded text-xs">
                      +{project.members.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showAddModal && (
        <ProjectModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}

function ProjectModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'new' as 'new' | 'ongoing' | 'completed',
    members: '',
    funding: 0,
    achievements: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall('/projects', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          members: formData.members.split(',').map(m => m.trim()).filter(Boolean),
        }),
      });
      toast.success('Project created');
      onSave();
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-orange-500/20 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Add Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="new">New</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Members (comma separated)</label>
            <input
              type="text"
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="John, Jane, ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Funding ($)</label>
            <input
              type="number"
              value={formData.funding}
              onChange={(e) => setFormData({ ...formData, funding: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
