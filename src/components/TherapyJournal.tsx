import React from 'react';
import { EmotionState } from '../types';

interface TherapyJournalProps {
  entries: TherapyJournalEntry[];
  onBack: () => void;
}

export interface TherapyJournalEntry {
  id: string;
  date: Date;
  emotion: EmotionState;
  summary: string;
  notes?: string;
}

const TherapyJournal: React.FC<TherapyJournalProps> = ({ entries, onBack }) => {
  return (
    <div className="glassmorphism rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Therapy Journal</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 bg-white/10 hover:bg-white/20 text-white"
        >
          Back to Chat
        </button>
      </div>
      
      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <p className="mb-4">No journal entries yet.</p>
          <p>Your saved therapy sessions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{entry.emotion.emoji}</span>
                  <span className="font-medium">{entry.emotion.name}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{entry.summary}</p>
              {entry.notes && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-gray-400 text-xs font-medium mb-1">Your Notes:</p>
                  <p className="text-gray-300 text-sm">{entry.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapyJournal;
