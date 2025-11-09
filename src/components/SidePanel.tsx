import React, { useState } from 'react';
import EmotionGraph from './EmotionGraph';
import EmpathyGauge from './EmpathyGauge';
import RewardsCard from './RewardsCard';
import { EmotionState, AppMode } from '../types';

const modes: { id: AppMode, label: string, icon: string }[] = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'video', label: 'Video', icon: '🎥' },
    { id: 'voice', label: 'Voice', icon: '🎧' },
    { id: 'api', label: 'API', icon: '🧩' },
    { id: 'insights', label: 'Insights', icon: '📊' },
];

interface SidePanelProps {
    currentEmotion: EmotionState;
    activeMode: AppMode;
    setActiveMode: (mode: AppMode) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ currentEmotion, activeMode, setActiveMode }) => {
    const [activeTab, setActiveTab] = useState<'emotions' | 'rewards'>('emotions');
    
    return (
        <div className="glassmorphism rounded-2xl p-4 h-full flex flex-col gap-4">
            {/* Tab Navigation */}
            <div className="flex border-b border-white/10 mb-2">
                <button
                    onClick={() => setActiveTab('emotions')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'emotions' 
                            ? 'text-white border-b-2 border-indigo-400' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Emotions
                </button>
                <button
                    onClick={() => setActiveTab('rewards')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'rewards' 
                            ? 'text-white border-b-2 border-indigo-400' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Rewards
                </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'emotions' ? (
                    <>
                        <div className="mb-4">
                            <EmpathyGauge value={currentEmotion.score} />
                        </div>
                        <div className="h-64">
                            <EmotionGraph activeEmotion={currentEmotion.name} />
                        </div>
                    </>
                ) : (
                    <div className="h-full">
                        <RewardsCard className="h-full" />
                    </div>
                )}
            </div>
            
            {/* Mode Selector */}
            <div className="mt-auto pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {modes.map(mode => (
                        <button 
                            key={mode.id}
                            onClick={() => setActiveMode(mode.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                activeMode === mode.id 
                                ? 'bg-white/20 text-white neon-glow-purple' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {mode.icon} {mode.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SidePanel;