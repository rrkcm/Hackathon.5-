import React, { useState, useEffect, useRef } from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, PolarAngleAxis } from 'recharts';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  isSaving?: boolean;
}

const summaryData = [
  { name: 'Calm', value: 65, fill: '#3b82f6' },
  { name: 'Focused', value: 20, fill: '#84cc16' },
  { name: 'Anxious', value: 15, fill: '#ec4899' },
];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glassmorphism rounded-md p-2 text-sm">
          <p style={{ color: data.fill }}>{`${data.name}: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
};

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, onSave, isSaving = false }) => {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(notes);
    setIsSaved(true);
  };
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.querySelector('button')?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-modal-title"
    >
      <div 
        ref={modalRef}
        className="glassmorphism rounded-2xl w-full max-w-lg p-8 m-4 transform transition-all duration-300 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="summary-modal-title" className="text-2xl font-bold text-white mb-2 text-glow-purple">Post-Conversation Summary</h2>
        <p className="text-gray-300 mb-6">Here is the emotional breakdown of your session.</p>

        <div className="w-full h-64 mb-6">
          {isSaved && (
            <div className="mb-4 p-3 bg-green-500/20 text-green-300 rounded-lg text-sm">
              Journal entry saved successfully!
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="30%" 
                outerRadius="100%" 
                barSize={20} 
                data={summaryData}
                startAngle={90}
                endAngle={-270}
            >
                <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                />
                <RadialBar
                    background
                    dataKey="value"
                    angleAxisId={0}
                    animationDuration={1500}
                />
                 <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "14px", bottom: '10px' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-4">
          <label htmlFor="journal-notes" className="block text-sm font-medium text-gray-300 mb-2">
            Add notes to your journal (optional)
          </label>
          <textarea
            id="journal-notes"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Add any additional notes about this session..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSaving || isSaved}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-300 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaved ? 'Close' : 'Cancel'}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : isSaved ? (
              'Saved!'
            ) : (
              'Save to Therapy Journal'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;