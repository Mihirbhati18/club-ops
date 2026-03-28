import { motion } from 'motion/react';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a1628_1px,transparent_1px),linear-gradient(to_bottom,#0a1628_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="inline-block mb-8"
        >
          <AlertCircle className="w-24 h-24 text-red-500" />
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-red-400 to-orange-600 bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Access Denied
        </h2>
        
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          The requested resource could not be found in the CYSCOM system
        </p>

        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
        >
          <Home className="w-5 h-5" />
          Return to Control Room
        </motion.button>
      </motion.div>
    </div>
  );
}
