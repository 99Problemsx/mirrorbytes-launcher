import React from 'react';
import { motion } from 'framer-motion';
import { FiMinus, FiMaximize2, FiX } from 'react-icons/fi';

const TitleBar = () => {
  const handleMinimize = () => {
    window.electron?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electron?.maximizeWindow();
  };

  const handleClose = () => {
    window.electron?.closeWindow();
  };

  return (
    <div className="h-8 bg-dark-800/80 backdrop-blur-md flex items-center justify-between px-4 select-none relative z-50 border-b border-white/5"
         style={{ WebkitAppRegion: 'drag' }}>
      {/* Logo & Title */}
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="w-4 h-4 bg-gradient-to-br from-red-500 to-purple-600 rounded-sm glow-effect"
        ></motion.div>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-semibold text-white/90 tracking-wider"
        >
          MIRRORBYTES STUDIO
        </motion.span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center space-x-1" style={{ WebkitAppRegion: 'no-drag' }}>
        <motion.button
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMinimize}
          className="w-10 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded"
        >
          <FiMinus size={14} />
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMaximize}
          className="w-10 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded"
        >
          <FiMaximize2 size={12} />
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.8)', scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="w-10 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded"
        >
          <FiX size={16} />
        </motion.button>
      </div>
    </div>
  );
};

export default TitleBar;
