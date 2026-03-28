import { motion } from 'motion/react';
import { Info, Target, Users, Mail, Phone, MapPin, Award } from 'lucide-react';

export default function AboutPage() {
  const facultyCoordinators = [
    { name: 'Dr. Sarah Johnson', role: 'Faculty Advisor', email: 'sarah.j@university.edu' },
    { name: 'Prof. Michael Chen', role: 'Technical Coordinator', email: 'm.chen@university.edu' },
  ];

  const achievements = [
    { year: '2025', title: 'Best Tech Club Award', description: 'Regional Inter-University Competition' },
    { year: '2024', title: 'Innovation Excellence', description: 'National Hackathon Championship' },
    { year: '2023', title: 'Community Impact', description: 'Outstanding Social Initiative' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-400 to-slate-600 bg-clip-text text-transparent mb-4">
          About CYSCOM
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          Empowering students through technology, innovation, and collaboration
        </p>
      </motion.div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-500/20 rounded-xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed mb-4">
          CYSCOM (Computer and Information Systems Club) is dedicated to fostering a community of passionate 
          technologists, innovators, and problem-solvers. We believe in learning through hands-on experience, 
          collaborative projects, and real-world applications.
        </p>
        <p className="text-gray-300 text-lg leading-relaxed">
          Our mission is to bridge the gap between academic knowledge and industry requirements, 
          preparing students for successful careers in technology while making a positive impact on society.
        </p>
      </motion.div>

      {/* Club Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-500/20 rounded-xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Who We Are</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-800/30 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Community</h3>
            <p className="text-gray-400">
              A diverse group of tech enthusiasts from various backgrounds and skill levels
            </p>
          </div>
          <div className="text-center p-6 bg-gray-800/30 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Innovation</h3>
            <p className="text-gray-400">
              Focused on cutting-edge technologies and creative problem-solving
            </p>
          </div>
          <div className="text-center p-6 bg-gray-800/30 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Excellence</h3>
            <p className="text-gray-400">
              Committed to delivering high-quality projects and continuous learning
            </p>
          </div>
        </div>
      </motion.div>

      {/* Faculty Coordinators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-500/20 rounded-xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Faculty Coordinators</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facultyCoordinators.map((faculty, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-6 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-green-500/30 transition-all"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-1">{faculty.name}</h3>
              <p className="text-cyan-400 text-center mb-3">{faculty.role}</p>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>{faculty.email}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-500/20 rounded-xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Our Achievements</h2>
        </div>
        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-start gap-4 p-6 bg-gray-800/30 rounded-lg border-l-4 border-yellow-500"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="text-yellow-400 font-bold text-lg">{achievement.year}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{achievement.title}</h3>
                <p className="text-gray-400">{achievement.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-500/20 rounded-xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Contact Us</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Email</p>
              <p className="text-white font-medium">cyscom@university.edu</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Phone</p>
              <p className="text-white font-medium">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Location</p>
              <p className="text-white font-medium">Campus Building A, Room 101</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-center bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-12"
      >
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the System?</h2>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Become part of an innovative community that's shaping the future of technology
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
        >
          JOIN THE SYSTEM
        </motion.button>
      </motion.div>
    </div>
  );
}
