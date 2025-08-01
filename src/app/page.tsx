'use client';

import { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from '@/components/ui/HomeScreen';
import { GuidanceScreen } from '@/components/ui/GuidanceScreen';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { type EmergencyScenario } from '@/utils/emergencyScenarios';

type AppState = 'idle' | 'listening' | 'processing' | 'guidance';

export default function Page() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<EmergencyScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const { play: playAudio, stop: stopAudio, audioState } = useTextToSpeech();

  const handleSpeechResult = useCallback((transcript: string) => {
    setFinalTranscript(transcript);
  }, []);

  const handleSpeechError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setAppState('idle');
  }, []);

  const { isListening, startListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  useEffect(() => {
    if (isListening) {
      setAppState('listening');
    } else if (appState === 'listening') {
      // If isListening becomes false while we were in the listening state, it means it stopped.
      // We don't immediately go to idle, because it might be processing a result.
    }
  }, [isListening, appState]);

  useEffect(() => {
    const processApiCall = async () => {
      if (!finalTranscript.trim()) return;

      setAppState('processing');
      try {
        const response = await fetch('/api/guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: finalTranscript }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to get a response from the AI.');
        }

        const scenario: EmergencyScenario = await response.json();
        setCurrentScenario(scenario);
        setCurrentStep(0);
        setAppState('guidance');
        
        if (audioEnabled && scenario.steps && scenario.steps.length > 0) {
          setTimeout(() => playAudio(scenario.steps[0].instruction), 500);
        }
      } catch (err: any) {
        setError(err.message);
        setAppState('idle');
      }
    };

    if (finalTranscript) {
      processApiCall();
    }
  }, [finalTranscript, audioEnabled, playAudio]);

  const handleEmergencyButtonClick = () => {
    if (appState === 'idle') {
      setError(null);
      setFinalTranscript('');
      stopAudio();
      startListening();
    }
  };

  const handleNextStep = useCallback(() => {
    if (!currentScenario) return;
    stopAudio();
    if (currentStep < currentScenario.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (audioEnabled) {
        setTimeout(() => playAudio(currentScenario.steps[nextStep].instruction), 300);
      }
    } else {
      handleStartOver();
    }
  }, [currentScenario, currentStep, audioEnabled, playAudio, stopAudio]);

  const handleStartOver = useCallback(() => {
    stopAudio();
    setAppState('idle');
    setCurrentScenario(null);
    setCurrentStep(0);
    setFinalTranscript('');
    setError(null);
  }, [stopAudio]);

  if (appState === 'guidance' && currentScenario) {
    return (
      <GuidanceScreen
        scenario={currentScenario}
        currentStep={currentStep}
        audioEnabled={audioEnabled}
        audioState={audioState}
        onNextStep={handleNextStep}
        onStartOver={handleStartOver}
        onToggleAudio={() => setAudioEnabled(prev => !prev)}
        onPlayAudio={playAudio}
        onStopAudio={stopAudio}
      />
    );
  }

  return (
    <HomeScreen
      appState={appState === 'idle' ? 'idle' : isListening ? 'listening' : 'processing'}
      error={error}
      finalTranscript={finalTranscript}
      audioEnabled={audioEnabled}
      onEmergencyClick={handleEmergencyButtonClick}
      onToggleAudio={() => setAudioEnabled(prev => !prev)}
      onShowDisclaimer={() => setShowDisclaimer(true)}
      onDismissError={() => setError(null)}
      isDisclaimerVisible={showDisclaimer}
      onCloseDisclaimer={() => setShowDisclaimer(false)}
    />
  );
}

