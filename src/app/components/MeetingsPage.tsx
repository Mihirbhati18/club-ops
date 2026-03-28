import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Plus, Calendar, Clock, FileText, Bell } from 'lucide-react';
import { apiCall } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { toast } from 'sonner';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  agenda: string;
  minutes?: string;
  type: 'scheduled' | 'completed';
  attendees: number;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [announcements] = useState([
    { id: 1, title: 'Upcoming Tech Talk', date: '2026-04-01', message: 'Guest speaker from Google' },
    { id: 2, title: 'Project Deadline', date: '2026-04-05', message: 'Submit project proposals by Friday' },
  ]);

  useEffect(() => {
    loadMeetings();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const user = await getCurrentUser();
    setUserRole(user?.role || '');
  };

  const loadMeetings = async () => {
    try {
      const response = await apiCall('/meetings');
      setMeetings(response.meetings || []);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMeeting = meetings.filter(m => m.type === 'scheduled')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
            Meetings
          </h1>
          <p className="text-gray-400 mt-1">Schedule and track club meetings</p>
        </div>
        {(userRole === 'Admin' || userRole === 'Member') && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Schedule Meeting</span>
          </motion.button>
        )}
      </div>

      {/* Next Meeting Countdown */}
      {nextMeeting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Next Meeting</h2>
          </div>
          <h3 className="text-xl text-white mb-2">{nextMeeting.title}</h3>
          <div className="flex items-center gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{nextMeeting.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{nextMeeting.time}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meetings List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Meeting Schedule</h2>
          {loading ? (
            <p className="text-center py-12 text-gray-400">Loading...</p>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-xl">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No meetings scheduled</p>
            </div>
          ) : (
            meetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{meeting.title}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      meeting.type === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {meeting.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>{meeting.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{meeting.time}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-300 mb-1">Agenda:</p>
                  <p className="text-sm text-gray-400">{meeting.agenda}</p>
                </div>

                {meeting.minutes && (
                  <div className="pt-3 border-t border-gray-800">
                    <p className="text-sm font-medium text-gray-300 mb-1">Minutes:</p>
                    <p className="text-sm text-gray-400">{meeting.minutes}</p>
                  </div>
                )}

                {meeting.type === 'completed' && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-400">Attendees: </span>
                    <span className="text-sm text-white font-medium">{meeting.attendees}</span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Announcements Sidebar */}
        <div className="space-y-4">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Announcements</h3>
            </div>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 bg-gray-800/30 rounded-lg border-l-4 border-blue-500"
                >
                  <h4 className="text-white font-medium mb-1">{announcement.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{announcement.message}</p>
                  <p className="text-xs text-gray-500">{announcement.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Meetings</span>
                <span className="text-white font-bold">{meetings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Scheduled</span>
                <span className="text-white font-bold">
                  {meetings.filter(m => m.type === 'scheduled').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Completed</span>
                <span className="text-white font-bold">
                  {meetings.filter(m => m.type === 'completed').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <MeetingModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            loadMeetings();
          }}
        />
      )}
    </div>
  );
}

function MeetingModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    agenda: '',
    type: 'scheduled' as 'scheduled' | 'completed',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall('/meetings', {
        method: 'POST',
        body: JSON.stringify({ ...formData, attendees: 0 }),
      });
      toast.success('Meeting scheduled');
      onSave();
    } catch (error) {
      toast.error('Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-blue-500/20 rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Schedule Meeting</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Agenda</label>
            <textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
