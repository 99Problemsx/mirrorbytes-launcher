import React from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiGrid, FiSettings, FiGift, FiTerminal, FiAward, FiFileText, FiCalendar, FiTarget, FiRss, FiDroplet, FiSave, FiBarChart2, FiDownload } from 'react-icons/fi';
import { SiDiscord } from 'react-icons/si';

const Sidebar = ({ games, selectedGame, onSelectGame, activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'home', icon: FiHome, label: 'Home', shortcut: 'Alt+1' },
    { id: 'library', icon: FiGrid, label: 'Bibliothek', shortcut: 'Alt+2' },
    { id: 'updates', icon: FiDownload, label: 'News & Updates', shortcut: 'Alt+3' },
    { id: 'dailylogin', icon: FiCalendar, label: 'Daily Rewards', shortcut: 'Alt+4' },
    { id: 'achievements', icon: FiAward, label: 'Belohnungen', shortcut: 'Alt+5' },
    { id: 'backup', icon: FiSave, label: 'Backups', shortcut: 'Alt+6' },
    { id: 'statistics', icon: FiBarChart2, label: 'Statistiken', shortcut: 'Alt+7' },
    { id: 'discord', icon: SiDiscord, label: 'Discord', shortcut: 'Alt+8' },
    { id: 'themes', icon: FiDroplet, label: 'Themes', shortcut: 'Alt+9' },
    { id: 'launchoptions', icon: FiTerminal, label: 'Launch Optionen' },
    { id: 'settings', icon: FiSettings, label: 'Einstellungen' },
  ];

  return (
    <aside className="w-20 bg-dark-800/50 backdrop-blur-md border-r border-white/5 flex flex-col items-center py-6 relative z-20 overflow-y-auto overflow-x-hidden">
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, var(--theme-primary-rgb, 139, 92, 246) 0.1, transparent 50%, var(--theme-secondary-rgb, 220, 38, 38) 0.1)',
          opacity: 0.15
        }}
      ></div>
      
      {/* Menu Items */}
      <div className="flex-1 flex flex-col items-center space-y-2 w-full px-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSectionChange(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative group ${
                isActive
                  ? 'shadow-lg glow-effect'
                  : 'bg-dark-700/50 hover:bg-dark-600/50'
              }`}
              style={isActive ? { 
                background: `linear-gradient(to bottom right, var(--theme-primary), var(--theme-secondary))`,
                boxShadow: `0 0 20px var(--theme-primary)`
              } : {}}
            >
              <motion.div
                animate={{ 
                  rotate: isActive ? [0, 10, -10, 0] : 0 
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: isActive ? Infinity : 0,
                  repeatDelay: 2
                }}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
              </motion.div>
              
              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute left-full ml-2 px-3 py-2 bg-dark-700 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap text-sm shadow-lg z-50"
              >
                <div className="font-medium">{item.label}</div>
                {item.shortcut && (
                  <div className="text-xs text-gray-400 mt-1">
                    <kbd className="px-1.5 py-0.5 bg-dark-600 border border-gray-600 rounded text-xs">
                      {item.shortcut}
                    </kbd>
                  </div>
                )}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-dark-700 rotate-45"></div>
              </motion.div>

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full glow-effect"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Sparkle effect on active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(239, 68, 68, 0.3)',
                      '0 0 40px rgba(139, 92, 246, 0.5)',
                      '0 0 20px rgba(239, 68, 68, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
