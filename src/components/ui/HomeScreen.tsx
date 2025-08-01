'use client';

import { EmergencyButton } from '@/components/EmergencyButton';
import { DisclaimerModal } from '@/components/DisclaimerModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Heart, Volume2, VolumeX } from 'lucide-react';

interface HomeScreenProps {
  appState: 'idle' | 'listening' | 'processing';
  error: string | null;
  finalTranscript: string;
  audioEnabled: boolean;
  onEmergencyClick: () => void;
  onToggleAudio: () => void;
  onShowDisclaimer: () => void;
  onDismissError: () => void;
  isDisclaimerVisible: boolean;
  onCloseDisclaimer: () => void;
}

export const HomeScreen = ({
  appState,
  error,
  finalTranscript,
  audioEnabled,
  onEmergencyClick,
  onToggleAudio,
  onShowDisclaimer,
  onDismissError,
  isDisclaimerVisible,
  onCloseDisclaimer,
}: HomeScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center p-4 relative">
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

      <div className="mb-4">
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            audioEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          Audio {audioEnabled ? 'On' : 'Off'}
        </button>
      </div>

      <div className="mb-8">
        <EmergencyButton state={appState} onClick={onEmergencyClick} />
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
    </div>
  );
};
