import React from 'react';
import { EmotionState } from '../types';

interface TopBarProps {
  currentEmotion: EmotionState;
  onEmotionChange: (emotion: EmotionState) => void;
  onJournalClick: () => void;
  onProgressClick?: () => void;
  showProgressButton?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  currentEmotion,
  onEmotionChange,
  onJournalClick,
  onProgressClick = () => {},
  showProgressButton = false
}) => {
  // Emotion selection handler
  const handleEmotionClick = () => {
    // Cycle to the next emotion
    const currentIndex = emotionCycle.findIndex(e => e.name === currentEmotion.name);
    const nextIndex = (currentIndex + 1) % emotionCycle.length;
    onEmotionChange(emotionCycle[nextIndex]);
  };

  const emotionCycle = [
    { name: 'happy', emoji: '😊', color: '#4CAF50' },
    { name: 'calm', emoji: '😌', color: '#2196F3' },
    { name: 'neutral', emoji: '😐', color: '#9E9E9E' },
    { name: 'sad', emoji: '😔', color: '#607D8B' },
    { name: 'anxious', emoji: '😟', color: '#FF9800' },
  ];

  return (
    <header className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">NeuroBridge</h1>
          <button
            onClick={handleEmotionClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all duration-300 hover:bg-white/20"
            style={{ backgroundColor: `${currentEmotion.color}40` }}
            aria-label="Change emotion"
          >
            {currentEmotion.emoji}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onJournalClick}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <span>📔</span>
            <span>Journal</span>
          </button>
          
          {showProgressButton && (
            <button
              onClick={onProgressClick}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <span>📊</span>
              <span>Progress</span>
            </button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;