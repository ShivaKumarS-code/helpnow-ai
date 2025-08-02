'use client';

import { useState } from 'react';
import { EmergencyButton } from '@/components/EmergencyButton';
import { DisclaimerModal } from '@/components/DisclaimerModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Heart, Info } from 'lucide-react';
import { AboutModal } from '@/components/AboutModal';
import { TextInput } from '@/components/TextInput';

interface HomeScreenProps {
  appState: 'idle' | 'listening' | 'processing';
  error: string | null;
  finalTranscript: string;
  onEmergencyClick: () => void;
  onShowDisclaimer: () => void;
  onDismissError: () => void;
  isDisclaimerVisible: boolean;
  onCloseDisclaimer: () => void;
  onTextInputSubmit: (text: string) => void;
}

export const HomeScreen = ({
  appState,
  error,
  finalTranscript,
  onEmergencyClick,
  onShowDisclaimer,
  onDismissError,
  isDisclaimerVisible,
  onCloseDisclaimer,
  onTextInputSubmit,
}: HomeScreenProps) => {
  const [isAboutModalOpen, setAboutModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => setAboutModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Info className="w-5 h-5" />
          <span className="font-medium">About</span>
        </button>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-800">HelpNow AI</h1>
        </div>
        <p className="text-gray-600 font-medium">Your On-the-Spot Emergency Guide</p>
      </div>

      <div className="mb-8">
        <EmergencyButton state={appState} onClick={onEmergencyClick} />
      </div>

      <div className="w-full max-w-md mb-4">
        <TextInput
          onSubmit={onTextInputSubmit}
          disabled={appState === 'listening' || appState === 'processing'}
        />
      </div>

      <div className="text-center mb-8 h-12">
        <p className="text-lg text-gray-700 mb-2 max-w-md">
          {appState === 'listening'
            ? 'Listening...'
            : appState === 'processing'
            ? 'Analyzing situation...'
            : 'Tap to start the emergency guide'}
        </p>
        {appState === 'processing' && finalTranscript && (
          <p className="text-sm text-gray-500 italic">"{finalTranscript}"</p>
        )}
      </div>

      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded max-w-md mx-auto" role="alert">
          <p className="text-sm">{error}</p>
          <button onClick={onDismissError} className="text-xs underline mt-1 hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="absolute bottom-4 text-center">
        <button onClick={onShowDisclaimer} className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors">
          Important Disclaimer
        </button>
      </div>

      <DisclaimerModal isOpen={isDisclaimerVisible} onClose={onCloseDisclaimer} />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setAboutModalOpen(false)} />
    </div>
  );
};
