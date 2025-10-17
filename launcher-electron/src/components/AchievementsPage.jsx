import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiStar, FiLock, FiGift } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Verfügbare Mystery Gift Codes
const MYSTERY_CODES = {
  'ILLUSION2025': {
    name: 'Launch Bonus',
    description: '5000 Pokédollar + 10 Pokébälle',
    rewards: ['5000$', '10x Pokéball'],
    icon: '💰',
    expires: null
  },
  'DISCORD100': {
    name: 'Discord Special',
    description: 'Seltenes Shiny Pokémon',
    rewards: ['Shiny Pokémon'],
    icon: '✨',
    expires: null
  },
  'BETA': {
    name: 'Beta Tester Reward',
    description: 'Exklusives Beta-Item',
    rewards: ['Beta-Badge', '1000$'],
    icon: '🧪',
    expires: null
  }
};

const ACHIEVEMENTS = [
  {
    id: 'first_launch',
    name: 'Erstes Abenteuer',
    description: 'Starte das Spiel zum ersten Mal',
    icon: '🎮',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'play_10h',
    name: 'Pokémon Trainer',
    description: 'Spiele 10 Stunden',
    icon: '⏱️',
    rarity: 'uncommon',
    points: 25,
  },
  {
    id: 'play_50h',
    name: 'Pokémon Meister',
    description: 'Spiele 50 Stunden',
    icon: '🏆',
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'play_100h',
    name: 'Pokémon Champion',
    description: 'Spiele 100 Stunden',
    icon: '👑',
    rarity: 'epic',
    points: 100,
  },
  {
    id: 'early_bird',
    name: 'Frühaufsteher',
    description: 'Spiele vor 6 Uhr morgens',
    icon: '🌅',
    rarity: 'rare',
    points: 30,
  },
  {
    id: 'night_owl',
    name: 'Nachteule',
    description: 'Spiele nach Mitternacht',
    icon: '🦉',
    rarity: 'rare',
    points: 30,
  },
  {
    id: 'daily_streak_7',
    name: 'Wöchentliche Hingabe',
    description: 'Spiele 7 Tage in Folge',
    icon: '🔥',
    rarity: 'uncommon',
    points: 40,
  },
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Nutze die Beta-Version',
    icon: '🧪',
    rarity: 'legendary',
    points: 200,
  },
];

const RARITY_COLORS = {
  common: 'from-gray-500 to-gray-600',
  uncommon: 'from-green-500 to-green-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-orange-600',
};

const AchievementsPage = ({ selectedGame }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showNotification, setShowNotification] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [activeTab, setActiveTab] = useState('achievements'); // 'achievements' or 'rewards'
  const [mysteryCode, setMysteryCode] = useState('');
  const [redeemedCodes, setRedeemedCodes] = useState([]);

  useEffect(() => {
    loadAchievements();
    loadRedeemedCodes();
  }, []);

  const loadAchievements = () => {
    try {
      const stored = localStorage.getItem(`mirrorbytes_achievements_${selectedGame.id}`);
      if (stored) {
        const unlocked = JSON.parse(stored);
        setUnlockedAchievements(unlocked);
        calculateTotalPoints(unlocked);
      }
      
      // Load redeemed codes
      const codesStored = localStorage.getItem(`mirrorbytes_redeemed_codes_${selectedGame.id}`);
      if (codesStored) {
        setRedeemedCodes(JSON.parse(codesStored));
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };

  const loadRedeemedCodes = () => {
    try {
      const stored = localStorage.getItem(`mirrorbytes_redeemed_codes_${selectedGame.id}`);
      if (stored) {
        setRedeemedCodes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load redeemed codes:', error);
    }
  };

  const redeemCode = async () => {
    const code = mysteryCode.trim().toUpperCase();
    
    if (!code) {
      toast.error('❌ Bitte gib einen Code ein!');
      return;
    }

    if (redeemedCodes.includes(code)) {
      toast.warning('⚠️ Dieser Code wurde bereits eingelöst!');
      return;
    }

    const reward = MYSTERY_CODES[code];
    if (!reward) {
      toast.error('❌ Ungültiger Code!');
      return;
    }

    // Code einlösen
    const newRedeemed = [...redeemedCodes, code];
    setRedeemedCodes(newRedeemed);
    localStorage.setItem(`mirrorbytes_redeemed_codes_${selectedGame.id}`, JSON.stringify(newRedeemed));

    // Speichere für das Spiel (Electron API)
    if (window.electronAPI?.saveMysteryGifts) {
      try {
        await window.electronAPI.saveMysteryGifts(newRedeemed);
        console.log('✅ Mystery Gifts saved for game');
      } catch (error) {
        console.error('Failed to save mystery gifts for game:', error);
      }
    }

    // Success notification
    toast.success(`🎁 ${reward.name} eingelöst!\n\nStarte das Spiel um die Belohnungen zu erhalten!`, {
      position: 'top-center',
      autoClose: 7000
    });

    setMysteryCode('');
  };

  const calculateTotalPoints = (unlocked) => {
    const points = unlocked.reduce((sum, id) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === id);
      return sum + (achievement?.points || 0);
    }, 0);
    setTotalPoints(points);
  };

  const isUnlocked = (achievementId) => {
    return unlockedAchievements.includes(achievementId);
  };

  const getProgress = () => {
    return {
      unlocked: unlockedAchievements.length,
      total: ACHIEVEMENTS.length,
      percentage: Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100),
    };
  };

  const progress = getProgress();

  return (
    <div className="h-full p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header with Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
                {activeTab === 'achievements' ? (
                  <>
                    <FiAward className="text-yellow-400" size={32} />
                    <span>Belohnungen</span>
                  </>
                ) : (
                  <>
                    <FiGift className="text-purple-400" size={32} />
                    <span>Mystery Gifts</span>
                  </>
                )}
              </h1>
              <p className="text-gray-400">
                {activeTab === 'achievements' 
                  ? 'Sammle Achievements und verdiene Punkte!'
                  : 'Erhalte spezielle Belohnungen und Items!'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 bg-dark-700/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🏆 Achievements
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'rewards'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎁 Mystery Gifts
            </button>
          </div>
        </div>

        {activeTab === 'achievements' ? (
          <>
        {/* Progress Overview */}
        <div className="glass-effect rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{progress.unlocked} / {progress.total}</h3>
              <p className="text-sm text-gray-400">Achievements freigeschaltet</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-yellow-400">{totalPoints} Punkte</h3>
              <p className="text-sm text-gray-400">Insgesamt verdient</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-dark-800 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">{progress.percentage}% abgeschlossen</p>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);

            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: unlocked ? 1.05 : 1 }}
                className={`glass-effect rounded-xl p-4 ${
                  unlocked ? 'border-2 border-cyan-500/50' : 'opacity-60'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                    unlocked
                      ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}`
                      : 'bg-dark-700'
                  }`}>
                    {unlocked ? achievement.icon : <FiLock />}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold mb-1 flex items-center space-x-2">
                      <span>{achievement.name}</span>
                      {unlocked && <FiStar className="text-yellow-400" size={16} />}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        unlocked ? 'bg-theme-accent/20 text-theme-accent' : 'bg-dark-700 text-gray-500'
                      }`}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                      <span className="text-sm font-bold text-yellow-400">
                        +{achievement.points} Punkte
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Achievement Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed bottom-8 right-8 glass-effect-strong rounded-xl p-6 border-2 border-cyan-500 max-w-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{showNotification.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Achievement freigeschaltet!</h3>
                  <p className="text-sm text-gray-300">{showNotification.name}</p>
                  <p className="text-xs text-yellow-400 mt-1">+{showNotification.points} Punkte</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        ) : (
          /* Mystery Gifts Tab */
          <div className="space-y-4">
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold mb-2">Mystery Gifts</h3>
              <p className="text-gray-400 mb-6">
                Löse spezielle Codes ein und erhalte exklusive Belohnungen!
              </p>

              {/* Code Input */}
              <div className="max-w-md mx-auto mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={mysteryCode}
                    onChange={(e) => setMysteryCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && redeemCode()}
                    placeholder="Gib einen Code ein..."
                    className="flex-1 px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 transition-colors uppercase"
                  />
                  <button 
                    onClick={redeemCode}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    Einlösen
                  </button>
                </div>
              </div>

              {/* Redeemed Codes */}
              {redeemedCodes.length > 0 && (
                <div className="max-w-md mx-auto mb-6">
                  <h4 className="font-bold mb-3 text-green-400">✅ Eingelöste Codes:</h4>
                  <div className="space-y-2">
                    {redeemedCodes.map((code) => {
                      const reward = MYSTERY_CODES[code];
                      return (
                        <div key={code} className="bg-dark-700/50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{reward?.icon || '🎁'}</span>
                            <div className="text-left">
                              <p className="font-bold text-sm">{reward?.name || code}</p>
                              <p className="text-xs text-gray-400">{reward?.description}</p>
                            </div>
                          </div>
                          <span className="text-xs text-green-400 font-mono">{code}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Rewards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="bg-dark-700/50 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-3xl mb-2">💎</div>
                  <h4 className="font-bold mb-1">Seltene Items</h4>
                  <p className="text-sm text-gray-400">
                    Erhalte seltene Items und Ressourcen
                  </p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-3xl mb-2">✨</div>
                  <h4 className="font-bold mb-1">Spezielle Pokémon</h4>
                  <p className="text-sm text-gray-400">
                    Erhalte exklusive Event-Pokémon
                  </p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-3xl mb-2">🎨</div>
                  <h4 className="font-bold mb-1">Kosmetische Items</h4>
                  <p className="text-sm text-gray-400">
                    Customize deinen Charakter
                  </p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-3xl mb-2">💰</div>
                  <h4 className="font-bold mb-1">In-Game Währung</h4>
                  <p className="text-sm text-gray-400">
                    Erhalte zusätzliches Geld
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-gray-300">
                  💡 <strong>Tipp:</strong> Folge uns auf Social Media um keine Codes zu verpassen!
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AchievementsPage;
