'use client'

import { Heart, Mic, Loader2 } from 'lucide-react';

interface EmergencyButtonProps {
  state: 'idle' | 'listening' | 'processing';
  onClick: () => void;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ state, onClick }) => {
  const getButtonContent = () => {
    switch (state) {
      case 'listening':
        return (
          <>
            <Mic className="w-8 h-8 mb-2" />
            <span className="text-lg font-bold">LISTENING...</span>
          </>
        );
      case 'processing':
        return (
          <>
            <Loader2 className="w-8 h-8 mb-2 animate-spin" />
            <span className="text-lg font-bold">THINKING...</span>
          </>
        );
      default:
        return (
          <>
            <div className="text-4xl mb-2">🆘</div>
            <span className="text-xl font-bold">GET HELP NOW</span>
          </>
        );
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "w-64 h-64 rounded-full flex flex-col items-center justify-center text-white font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl";
    
    switch (state) {
      case 'listening':
        return `${baseClasses} bg-red-500 animate-pulse`;
      case 'processing':
        return `${baseClasses} bg-red-600`;
      default:
        return `${baseClasses} bg-red-500 hover:bg-red-600`;
    }
  };

  return (
    <button
      onClick={onClick}
      className={getButtonClasses()}
      disabled={state === 'processing'}
    >
      {getButtonContent()}
    </button>
  );
};