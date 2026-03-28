import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Plus, Edit, Trash2, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { apiCall } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  coordinators: string[];
  registrationLimit: number;
  registrations: number;
  registrationDeadline: string;
  expenses: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    loadEvents();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const user = await getCurrentUser();
    setUserRole(user?.role || '');
  };

  const loadEvents = async () => {
    try {
      const response = await apiCall('/events');
      setEvents(response.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await apiCall(`/events/${id}`, { method: 'DELETE' });
      toast.success('Event deleted');
      loadEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(e => 
    filter === 'all' ? true : e.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Events
          </h1>
          <p className="text-gray-400 mt-1">Manage and track club events</p>
        </div>
        {(userRole === 'Admin' || userRole === 'Member') && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Create Event</span>
          </motion.button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === type
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
          <Calendar className="w-8 h-8 text-cyan-400 mb-2" />
          <p className="text-2xl font-bold text-white">{events.length}</p>
          <p className="text-gray-400 text-sm">Total Events</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
          <Clock className="w-8 h-8 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            {events.filter(e => e.status === 'upcoming').length}
          </p>
          <p className="text-gray-400 text-sm">Upcoming</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl border border-green-500/20 rounded-xl p-6">
          <Users className="w-8 h-8 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            {events.reduce((sum, e) => sum + e.registrations, 0)}
          </p>
          <p className="text-gray-400 text-sm">Total Registrations</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
          <DollarSign className="w-8 h-8 text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            ${events.reduce((sum, e) => sum + (e.expenses || 0), 0)}
          </p>
          <p className="text-gray-400 text-sm">Total Expenses</p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-xl">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No events found</p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === 'upcoming' ? 'bg-cyan-500/20 text-cyan-400' :
                    event.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {event.status}
                  </span>
                </div>

                {userRole === 'Admin' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300">
                    {event.date} at {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300">{event.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300">
                    Organizer: {event.organizer}
                  </span>
                </div>
              </div>

              {/* Registration Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Registrations</span>
                  <span className="text-sm text-white font-medium">
                    {event.registrations} / {event.registrationLimit}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                    style={{ width: `${(event.registrations / event.registrationLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-400">Expenses: </span>
                  <span className="text-white font-medium">${event.expenses || 0}</span>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm hover:shadow-lg transition-all">
                  View Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingEvent) && (
        <EventModal
          event={editingEvent}
          onClose={() => {
            setShowAddModal(false);
            setEditingEvent(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingEvent(null);
            loadEvents();
          }}
        />
      )}
    </div>
  );
}

function EventModal({ 
  event, 
  onClose, 
  onSave 
}: { 
  event: Event | null; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    time: event?.time || '',
    venue: event?.venue || '',
    organizer: event?.organizer || '',
    coordinators: event?.coordinators.join(', ') || '',
    registrationLimit: event?.registrationLimit || 100,
    registrationDeadline: event?.registrationDeadline || '',
    expenses: event?.expenses || 0,
    status: event?.status || 'upcoming',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        coordinators: formData.coordinators.split(',').map(c => c.trim()).filter(Boolean),
      };

      if (event) {
        await apiCall(`/events/${event.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Event updated');
      } else {
        await apiCall('/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Event created');
      }

      onSave();
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-cyan-500/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {event ? 'Edit Event' : 'Create Event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Organizer</label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Registration Limit</label>
              <input
                type="number"
                value={formData.registrationLimit}
                onChange={(e) => setFormData({ ...formData, registrationLimit: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Expenses ($)</label>
              <input
                type="number"
                value={formData.expenses}
                onChange={(e) => setFormData({ ...formData, expenses: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
