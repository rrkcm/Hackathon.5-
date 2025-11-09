export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: number;
}

interface RewardState {
  xp: number;
  streak: number;
  lastActivityDate: string;
  badges: Badge[];
  activityTypes: Set<string>;
  totalFocusedTime: number; // in seconds
}

// Initialize default badges
const DEFAULT_BADGES: Omit<Badge, 'earned'>[] = [
  { id: 'starter', name: 'Starter', description: 'Complete your first activity' },
  { id: 'focus_10', name: 'Focus 10', description: 'Spend 10 minutes on activities' },
  { id: 'streak_3', name: 'Streak x3', description: 'Maintain a 3-day streak' },
  { id: 'explorer', name: 'Explorer', description: 'Try all activity types' },
];

// Load or initialize reward state from localStorage
const loadState = (): RewardState => {
  const saved = localStorage.getItem('nb_rewards_v1');
  const today = new Date().toDateString();
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure all default badges exist
      const badges = DEFAULT_BADGES.map(defaultBadge => {
        const existingBadge = parsed.badges?.find((b: Badge) => b.id === defaultBadge.id);
        return existingBadge || { ...defaultBadge, earned: false };
      });
      
      return {
        xp: parsed.xp || 0,
        streak: parsed.streak || 0,
        lastActivityDate: parsed.lastActivityDate || '',
        badges,
        activityTypes: new Set(parsed.activityTypes || []),
        totalFocusedTime: parsed.totalFocusedTime || 0,
      };
    } catch (e) {
      console.error('Error parsing reward state, resetting...', e);
    }
  }

  // Return default state if nothing is saved or there was an error
  return {
    xp: 0,
    streak: 0,
    lastActivityDate: '',
    badges: DEFAULT_BADGES.map(badge => ({ ...badge, earned: false })),
    activityTypes: new Set(),
    totalFocusedTime: 0,
  };
};

// Save state to localStorage
const saveState = (state: RewardState) => {
  const toSave = {
    ...state,
    activityTypes: Array.from(state.activityTypes),
  };
  localStorage.setItem('nb_rewards_v1', JSON.stringify(toSave));
};

// Get current state
const getState = (): RewardState => {
  const state = loadState();
  return state;
};

// Update and persist state
const updateState = (updater: (state: RewardState) => RewardState) => {
  const state = loadState();
  const newState = updater(state);
  saveState(newState);
  return newState;
};

// Public API
export const rewardEngine = {
  // XP methods
  addXP: (amount: number): number => {
    return updateState(state => {
      const newXP = state.xp + amount;
      return { ...state, xp: newXP };
    }).xp;
  },

  getXP: (): number => {
    return getState().xp;
  },

  // Streak methods
  incrementStreakIfNewDay: (): number => {
    return updateState(state => {
      const today = new Date().toDateString();
      
      if (state.lastActivityDate === today) {
        return state; // Already updated today
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = state.lastActivityDate === yesterday.toDateString();
      
      const newStreak = wasYesterday || state.lastActivityDate === '' ? state.streak + 1 : 1;
      
      // Check for streak badge
      if (newStreak >= 3 && !state.badges.some(b => b.id === 'streak_3' && b.earned)) {
        state.badges = state.badges.map(badge => 
          badge.id === 'streak_3' 
            ? { ...badge, earned: true, earnedAt: Date.now() }
            : badge
        );
      }

      return {
        ...state,
        streak: newStreak,
        lastActivityDate: today,
      };
    }).streak;
  },

  getStreak: (): number => {
    return getState().streak;
  },

  // Badge methods
  grantBadge: (id: string): boolean => {
    return updateState(state => {
      const badgeIndex = state.badges.findIndex(b => b.id === id);
      if (badgeIndex === -1 || state.badges[badgeIndex].earned) {
        return state; // Badge doesn't exist or already earned
      }

      const updatedBadges = [...state.badges];
      updatedBadges[badgeIndex] = {
        ...updatedBadges[badgeIndex],
        earned: true,
        earnedAt: Date.now(),
      };

      return { ...state, badges: updatedBadges };
    }).badges.some(b => b.id === id && b.earned);
  },

  hasBadge: (id: string): boolean => {
    return getState().badges.some(b => b.id === id && b.earned);
  },

  listBadges: (): Badge[] => {
    return [...getState().badges];
  },

  // Activity tracking
  recordEvent: (event: { type: string; correct: boolean; durationSec: number }) => {
    return updateState(state => {
      const { type, correct, durationSec } = event;
      let newState = { ...state };
      
      // Add XP for correct answers
      if (correct) {
        newState.xp += 10; // Base XP for correct answer
      }
      
      // Track activity type for Explorer badge
      if (!newState.activityTypes.has(type)) {
        newState.activityTypes = new Set([...newState.activityTypes, type]);
        
        // Check for Explorer badge
        if (newState.activityTypes.size >= 3 && !newState.badges.some(b => b.id === 'explorer' && b.earned)) {
          newState.badges = newState.badges.map(badge => 
            badge.id === 'explorer' 
              ? { ...badge, earned: true, earnedAt: Date.now() }
              : badge
          );
        }
      }
      
      // Track focused time for Focus 10 badge
      newState.totalFocusedTime += durationSec;
      if (newState.totalFocusedTime >= 600 && !newState.badges.some(b => b.id === 'focus_10' && b.earned)) {
        newState.badges = newState.badges.map(badge => 
          badge.id === 'focus_10' 
            ? { ...badge, earned: true, earnedAt: Date.now() }
            : badge
        );
      }
      
      // Grant Starter badge on first activity if not already granted
      const hasStarterBadge = newState.badges.some(b => b.id === 'starter' && b.earned);
      if (!hasStarterBadge) {
        newState.badges = newState.badges.map(badge => 
          badge.id === 'starter' 
            ? { ...badge, earned: true, earnedAt: Date.now() }
            : badge
        );
      }
      
      // Update streak if needed
      rewardEngine.incrementStreakIfNewDay();
      
      return newState;
    });
  },

  // Development helper
  debugAddXP: (amount: number = 10) => {
    if (process.env.NODE_ENV !== 'production') {
      return rewardEngine.addXP(amount);
    }
    return rewardEngine.getXP();
  },

  // Reset for testing (development only)
  _reset: () => {
    if (process.env.NODE_ENV !== 'production') {
      localStorage.removeItem('nb_rewards_v1');
    }
  },
};

export default rewardEngine;
