'use client';

import { useState } from 'react';
import { EmergencyButton } from '@/components/EmergencyButton';
import { GuideCard } from '@/components/GuideCard';
import { DisclaimerModal } from '@/components/DisclaimerModal';
import { getRandomScenario, type EmergencyScenario } from '@/utils/emergencyScenarios';
import { Heart } from 'lucide-react';

type AppState = 'home' | 'listening' | 'processing' | 'guidance';

export default function Page() {
  const [appState, setAppState] = useState<AppState>('home');
  const [currentScenario, setCurrentScenario] = useState<EmergencyScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleEmergencyButtonClick = () => {
    if (appState === 'home') {
      setAppState('listening');

      // Simulate listening for 2 seconds
      setTimeout(() => {
        setAppState('processing');

        // Simulate processing for 1.5 seconds
        setTimeout(() => {
          const scenario = getRandomScenario();
          setCurrentScenario(scenario);
          setCurrentStep(0);
          setAppState('guidance');
        }, 1500);
      }, 2000);
    }
  };

  const handleNextStep = () => {
    if (!currentScenario) return;

    if (currentStep < currentScenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Guide complete, return to home
      setAppState('home');
      setCurrentScenario(null);
      setCurrentStep(0);
    }
  };

  const handleStartOver = () => {
    setAppState('home');
    setCurrentScenario(null);
    setCurrentStep(0);
  };

  const renderHomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center p-4">
      {/* App Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-800">HelpNow AI</h1>
        </div>
        <p className="text-gray-600 font-medium">Your On-the-Spot Emergency Guide</p>
      </div>

      {/* Emergency Button */}
      <div className="mb-8">
        <EmergencyButton 
          state={appState === 'listening' ? 'listening' : appState === 'processing' ? 'processing' : 'idle'} 
          onClick={handleEmergencyButtonClick} 
        />
      </div>

      {/* Subtitle */}
      <p className="text-lg text-gray-700 text-center mb-8 max-w-md">
        {appState === 'listening' ? 
          'Listening for your emergency...' : 
          appState === 'processing' ? 
          'Analyzing situation...' : 
          'Tap to start the emergency guide'
        }
      </p>

      {/* Footer */}
      <div className="absolute bottom-4 text-center">
        <button
          onClick={() => setShowDisclaimer(true)}
          className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
        >
          Important Disclaimer
        </button>
      </div>

      <DisclaimerModal 
        isOpen={showDisclaimer} 
        onClose={() => setShowDisclaimer(false)} 
      />
    </div>
  );

  const renderGuidanceScreen = () => {
    if (!currentScenario) return null;

    const currentStepData = currentScenario.steps[currentStep];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col p-4">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{currentScenario.title}</h1>
          <button
            onClick={handleStartOver}
            className="text-sm text-red-500 hover:text-red-600 underline transition-colors"
          >
            ← Start Over
          </button>
        </div>

        {/* Guide Card */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg">
            <GuideCard
              step={currentStep + 1}
              totalSteps={currentScenario.steps.length}
              instruction={currentStepData.instruction}
              type={currentStepData.type}
              onNextStep={handleNextStep}
              isLastStep={currentStep === currentScenario.steps.length - 1}
            />
          </div>
        </div>

        {/* Emergency Call Reminder */}
        <div className="bg-red-500 text-white p-4 rounded-lg mt-6 text-center">
          <p className="font-bold">Remember: Call 108 for serious emergencies!</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {appState === 'guidance' ? renderGuidanceScreen() : renderHomeScreen()}
    </>
  );
}
