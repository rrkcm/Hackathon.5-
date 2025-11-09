import React, { useState, useEffect } from 'react';
import rewardEngine, { Badge } from '../services/rewardEngine';

interface RewardsCardProps {
  className?: string;
}

const RewardsCard: React.FC<RewardsCardProps> = ({ className = '' }) => {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Load initial data
  useEffect(() => {
    updateRewards();
    
    // Set up a refresh interval (e.g., every minute) to update the streak if needed
    const interval = setInterval(() => {
      rewardEngine.incrementStreakIfNewDay();
      updateRewards();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const updateRewards = () => {
    setXp(rewardEngine.getXP());
    setStreak(rewardEngine.getStreak());
    setBadges(rewardEngine.listBadges().filter(b => b.earned));
  };

  const handleAddTestXP = () => {
    if (process.env.NODE_ENV !== 'production') {
      rewardEngine.debugAddXP(10);
      updateRewards();
    }
  };

  // Sort badges by earnedAt (newest first), then by predefined order
  const sortedBadges = [...badges].sort((a, b) => {
    if (a.earnedAt && b.earnedAt) {
      return b.earnedAt - a.earnedAt; // Newest first
    }
    return 0;
  });

  // Only show the 5 most recent badges by default
  const visibleBadges = showAllBadges ? sortedBadges : sortedBadges.slice(0, 5);

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Your Rewards</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-indigo-900/30 p-3 rounded-lg">
          <div className="text-2xl font-bold text-indigo-300">{xp}</div>
          <div className="text-xs text-indigo-200">XP</div>
        </div>
        <div className="bg-amber-900/30 p-3 rounded-lg">
          <div className="text-2xl font-bold text-amber-300">{streak}</div>
          <div className="text-xs text-amber-200">Day Streak</div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-300">Badges</h4>
          {badges.length > 5 && (
            <button 
              onClick={() => setShowAllBadges(!showAllBadges)}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              {showAllBadges ? 'Show Less' : `Show All (${badges.length})`}
            </button>
          )}
        </div>
        
        {badges.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            Complete activities to earn badges!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleBadges.map((badge) => (
              <div 
                key={badge.id}
                className="relative group"
                title={`${badge.name}: ${badge.description}`}
              >
                <div className="bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-sm text-white flex items-center transition-colors">
                  <span className="mr-1">🏆</span>
                  <span className="truncate max-w-[80px]">{badge.name}</span>
                </div>
                <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 text-xs text-white bg-gray-800 rounded shadow-lg">
                  <div className="font-semibold">{badge.name}</div>
                  <div className="text-gray-300">{badge.description}</div>
                  {badge.earnedAt && (
                    <div className="mt-1 text-gray-400 text-xs">
                      Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            onClick={handleAddTestXP}
            className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-2 rounded transition-colors"
          >
            Test: Add 10 XP
          </button>
        </div>
      )}
    </div>
  );
};

export default RewardsCard;
