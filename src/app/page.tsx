'use client';

import { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from '@/components/ui/HomeScreen';
import { GuidanceScreen } from '@/components/ui/GuidanceScreen';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { type EmergencyScenario } from '@/utils/emergencyScenarios';

type AppState = 'idle' | 'listening' | 'processing' | 'guidance';

// Define the actual API response type
interface ApiEmergencyResponse {
  title: string;
  steps: Array<{
    instruction: string;
    type: 'warning' | 'action' | 'info';
    visualUrl?: string;
    alternativeUrls?: string[];
  }>;
}

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

  const handleTextInputSubmit = useCallback((text: string) => {
    if (text.trim()) {
      setFinalTranscript(text.trim());
    }
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

        // FIX: Get the raw response first, don't cast it immediately
        const apiResponse: ApiEmergencyResponse = await response.json();
        
        // Debug logging to see what we actually got
        console.log('Raw API Response:', apiResponse);
        console.log('First step visualUrl:', apiResponse.steps?.[0]?.visualUrl);
        console.log('First step alternativeUrls:', apiResponse.steps?.[0]?.alternativeUrls);
        
        // FIX: Transform the API response to match your EmergencyScenario interface
        // while preserving the image URLs
        const scenario: EmergencyScenario = {
          id: 'api-generated', // Add a default ID since API doesn't provide one
          title: apiResponse.title,
          steps: apiResponse.steps.map((step, index) => ({
            id: index + 1, // Add IDs since API doesn't provide them
            instruction: step.instruction,
            type: step.type,
            // IMPORTANT: Preserve the image URLs from the API response
            visualUrl: step.visualUrl,
            alternativeUrls: step.alternativeUrls || []
          }))
        };

        console.log('Transformed scenario:', scenario);
        console.log('First step after transform:', scenario.steps[0]);

        setCurrentScenario(scenario);
        setCurrentStep(0);
        setAppState('guidance');
        
        if (audioEnabled && scenario.steps && scenario.steps.length > 0) {
          setTimeout(() => playAudio(scenario.steps[0].instruction), 500);
        }
      } catch (err: any) {
        console.error('API call error:', err);
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

  const handlePreviousStep = useCallback(() => {
    if (!currentScenario) return;
    stopAudio();
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (audioEnabled) {
        setTimeout(() => playAudio(currentScenario.steps[prevStep].instruction), 300);
      }
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
        onPreviousStep={handlePreviousStep}
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
      onEmergencyClick={handleEmergencyButtonClick}
      onShowDisclaimer={() => setShowDisclaimer(true)}
      onDismissError={() => setError(null)}
      isDisclaimerVisible={showDisclaimer}
      onCloseDisclaimer={() => setShowDisclaimer(false)}
      onTextInputSubmit={handleTextInputSubmit}
    />
  );
}