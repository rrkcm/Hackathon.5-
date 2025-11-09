// Mock data structure for session logs
interface SessionLog {
  dateISO: string;
  emotion: 'happy' | 'calm' | 'neutral' | 'sad' | 'anxious';
  durationSec: number;
  xpEarned?: number;
  activityType?: string;
}

// Mock data for demonstration
const mockSessions: SessionLog[] = [
  // Current week's data (last 7 days)
  { dateISO: '2025-11-03', emotion: 'happy', durationSec: 1800, xpEarned: 50, activityType: 'math' },
  { dateISO: '2025-11-04', emotion: 'calm', durationSec: 1500, xpEarned: 40, activityType: 'reading' },
  { dateISO: '2025-11-05', emotion: 'neutral', durationSec: 1200, xpEarned: 30, activityType: 'science' },
  { dateISO: '2025-11-06', emotion: 'sad', durationSec: 900, xpEarned: 20, activityType: 'math' },
  { dateISO: '2025-11-07', emotion: 'anxious', durationSec: 600, xpEarned: 10, activityType: 'reading' },
  { dateISO: '2025-11-08', emotion: 'happy', durationSec: 2100, xpEarned: 60, activityType: 'science' },
  { dateISO: '2025-11-09', emotion: 'calm', durationSec: 1800, xpEarned: 45, activityType: 'math' },
];

// Get session data from localStorage or fallback to mock data
const getSessionData = (): SessionLog[] => {
  try {
    const savedSessions = localStorage.getItem('nb_sessions_v1');
    if (savedSessions) {
      return JSON.parse(savedSessions);
    }
  } catch (error) {
    console.error('Error parsing session data:', error);
  }
  return mockSessions;
};

// Get the date range for the current week (Monday to Sunday)
const getCurrentWeekDates = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1)); // Adjust for Sunday
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  return weekDates;
};

// Map emotions to scores
const emotionToScore = (emotion: string): number => {
  switch (emotion) {
    case 'happy': return 2;
    case 'calm': return 1;
    case 'neutral': return 0;
    case 'sad': return -1;
    case 'anxious': return -2;
    default: return 0;
  }
};

// Get weekly effort data (XP per day)
export const getWeeklyEffort = (): Array<{ date: string; xp: number }> => {
  const sessions = getSessionData();
  const weekDates = getCurrentWeekDates();
  
  // Group sessions by date and sum XP
  const dailyXP = new Map<string, number>();
  weekDates.forEach(date => dailyXP.set(date, 0));
  
  sessions.forEach(session => {
    if (weekDates.includes(session.dateISO)) {
      const currentXP = dailyXP.get(session.dateISO) || 0;
      dailyXP.set(session.dateISO, currentXP + (session.xpEarned || 0));
    }
  });
  
  return Array.from(dailyXP.entries()).map(([date, xp]) => ({
    date,
    xp
  }));
};

// Get weekly emotion data (average emotion score per day)
export const getWeeklyEmotion = (): Array<{ date: string; score: number }> => {
  const sessions = getSessionData();
  const weekDates = getCurrentWeekDates();
  
  // Group sessions by date and calculate average emotion score
  const dailyScores = new Map<string, { sum: number; count: number }>();
  weekDates.forEach(date => dailyScores.set(date, { sum: 0, count: 0 }));
  
  sessions.forEach(session => {
    if (weekDates.includes(session.dateISO)) {
      const dayData = dailyScores.get(session.dateISO)!;
      dayData.sum += emotionToScore(session.emotion);
      dayData.count += 1;
    }
  });
  
  return Array.from(dailyScores.entries()).map(([date, { sum, count }]) => ({
    date,
    score: count > 0 ? parseFloat((sum / count).toFixed(2)) : 0
  }));
};

// Get summary data for the current week
export const getSummary = () => {
  const sessions = getSessionData();
  const weekDates = getCurrentWeekDates();
  const weeklySessions = sessions.filter(session => 
    weekDates.includes(session.dateISO)
  );
  
  // Calculate total XP
  const totalXP = weeklySessions.reduce((sum, session) => sum + (session.xpEarned || 0), 0);
  
  // Calculate active days
  const activeDays = new Set(weeklySessions.map(session => session.dateISO)).size;
  
  // Find most frequent activity type
  const activityCounts = weeklySessions.reduce((acc, session) => {
    if (session.activityType) {
      acc[session.activityType] = (acc[session.activityType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const topActivity = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  
  return {
    totalXP,
    activeDays,
    topActivity,
  };
};

// Generate CSV data for export
export const generateCSV = (): string => {
  const effortData = getWeeklyEffort();
  const emotionData = getWeeklyEmotion();
  const summary = getSummary();
  
  // Combine data by date
  const combinedData = effortData.map((effort, index) => ({
    date: effort.date,
    xp: effort.xp,
    avgEmotionScore: emotionData[index]?.score || 0,
    topActivity: summary.topActivity
  }));
  
  // Convert to CSV
  const headers = ['Date', 'XP', 'Average Emotion Score', 'Top Activity'];
  const csvRows = [
    headers.join(','),
    ...combinedData.map(row => 
      [
        `"${row.date}"`,
        row.xp,
        row.avgEmotionScore,
        `"${row.topActivity}"`
      ].join(',')
    )
  ];
  
  return csvRows.join('\n');
};
