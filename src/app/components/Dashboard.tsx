import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Rocket, 
  MessageSquare, 
  Info,
  TrendingUp,
  Activity
} from 'lucide-react';
import { apiCall } from '../lib/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeEvents: 0,
    totalRevenue: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [eventsRes, financeRes, departmentsRes] = await Promise.all([
        apiCall('/events'),
        apiCall('/finance'),
        apiCall('/departments'),
      ]);

      const events = eventsRes.events || [];
      const finance = financeRes.finance || [];
      const departments = departmentsRes.departments || [];

      // Calculate stats
      const activeEvents = events.filter((e: any) => 
        new Date(e.date) > new Date()
      ).length;

      const totalRevenue = finance
        .filter((f: any) => f.type === 'income')
        .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);

      const totalMembers = departments.reduce(
        (sum: number, d: any) => sum + (d.members?.length || 0), 
        0
      );

      setStats({
        totalMembers,
        activeEvents,
        totalRevenue,
        attendanceRate: 85, // Mock data
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const orbitItems = [
    { 
      icon: Users, 
      label: 'Departments', 
      path: '/app/departments',
      color: 'from-purple-500 to-pink-500',
      angle: 0
    },
    { 
      icon: Calendar, 
      label: 'Events', 
      path: '/app/events',
      color: 'from-cyan-500 to-blue-500',
      angle: 60
    },
    { 
      icon: DollarSign, 
      label: 'Finance', 
      path: '/app/finance',
      color: 'from-green-500 to-emerald-500',
      angle: 120
    },
    { 
      icon: Rocket, 
      label: 'Projects', 
      path: '/app/projects',
      color: 'from-orange-500 to-red-500',
      angle: 180
    },
    { 
      icon: MessageSquare, 
      label: 'Meetings', 
      path: '/app/meetings',
      color: 'from-blue-500 to-indigo-500',
      angle: 240
    },
    { 
      icon: Info, 
      label: 'About', 
      path: '/app/about',
      color: 'from-gray-500 to-slate-500',
      angle: 300
    },
  ];

  const statCards = [
    { 
      label: 'Total Members', 
      value: stats.totalMembers, 
      icon: Users, 
      color: 'from-purple-500 to-pink-500',
      change: '+12%'
    },
    { 
      label: 'Active Events', 
      value: stats.activeEvents, 
      icon: Calendar, 
      color: 'from-cyan-500 to-blue-500',
      change: '+5%'
    },
    { 
      label: 'Total Revenue', 
      value: `$${stats.totalRevenue}`, 
      icon: DollarSign, 
      color: 'from-green-500 to-emerald-500',
      change: '+18%'
    },
    { 
      label: 'Attendance', 
      value: `${stats.attendanceRate}%`, 
      icon: Activity, 
      color: 'from-orange-500 to-red-500',
      change: '+3%'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
        >
          CONTROL ROOM
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          CYSCOM Operations Dashboard
        </motion.p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Orbit UI */}
      <div className="relative flex items-center justify-center py-12 md:py-20">
        {/* Central Core */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="relative z-10"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 40px rgba(6, 182, 212, 0.3)',
                '0 0 60px rgba(6, 182, 212, 0.6)',
                '0 0 40px rgba(6, 182, 212, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="mb-4"
              >
                <Activity className="w-12 h-12 md:w-16 md:h-16 text-white mx-auto" />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-bold text-white">CLUB STATUS</h2>
              <p className="text-cyan-100 text-sm md:text-base">ACTIVE</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Orbit Items */}
        <div className="absolute inset-0 flex items-center justify-center">
          {orbitItems.map((item, index) => {
            const radius = 180; // Distance from center
            const angle = (item.angle * Math.PI) / 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
                className="hidden lg:block"
              >
                <motion.button
                  onClick={() => navigate(item.path)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg hover:shadow-2xl transition-all`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-sm font-medium text-white bg-gray-900/90 px-3 py-1 rounded-full">
                      {item.label}
                    </span>
                  </div>
                  
                  {/* Connecting line */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="absolute top-1/2 left-1/2 w-px bg-gradient-to-b from-cyan-500/50 to-transparent origin-center"
                    style={{
                      height: `${radius - 120}px`,
                      transform: `translate(-50%, -50%) rotate(${item.angle + 180}deg)`,
                    }}
                  />
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Orbital rings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="w-96 h-96 md:w-[500px] md:h-[500px] border-2 border-cyan-500/20 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[450px] h-[450px] md:w-[600px] md:h-[600px] border border-blue-500/10 rounded-full"
          />
        </motion.div>
      </div>

      {/* Quick Access Grid for Mobile */}
      <div className="lg:hidden grid grid-cols-2 gap-4 mt-8">
        {orbitItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(item.path)}
            className={`p-6 bg-gradient-to-br ${item.color} rounded-xl shadow-lg active:scale-95 transition-all`}
          >
            <item.icon className="w-8 h-8 text-white mb-2 mx-auto" />
            <p className="text-white font-medium">{item.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { action: 'New event created', item: 'Tech Workshop 2026', time: '2 hours ago', type: 'event' },
            { action: 'Department updated', item: 'Web Development Team', time: '5 hours ago', type: 'department' },
            { action: 'Payment received', item: '$500 Sponsorship', time: '1 day ago', type: 'finance' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all"
            >
              <div>
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-gray-400 text-sm">{activity.item}</p>
              </div>
              <span className="text-gray-500 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
