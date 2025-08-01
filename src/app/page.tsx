'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { EmergencyButton } from '@/components/EmergencyButton';
import { GuideCard } from '@/components/GuideCard';
import { DisclaimerModal } from '@/components/DisclaimerModal';
import { type EmergencyScenario as BaseEmergencyScenario } from '@/utils/emergencyScenarios';
import { Heart, Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';

// --- Type Definitions ---
// We no longer need the audioData in the type
type EmergencyScenario = BaseEmergencyScenario;

// --- Type Definitions for Web Speech API ---
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}
interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

type AppState = 'idle' | 'listening' | 'processing' | 'guidance';
type AudioState = 'idle' | 'playing' | 'paused';

export default function Page() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentScenario, setCurrentScenario] = useState<EmergencyScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  
  const stopAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      isSpeakingRef.current = false;
      speechSynthesis.cancel();
      // Small delay to ensure cancellation is processed
      setTimeout(() => {
        setAudioState('idle');
      }, 50);
    } else {
      setAudioState('idle');
    }
    currentUtteranceRef.current = null;
  }, []);
  
  // Function to get the best female voice
  const getFemaleVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return null;
    
    const voices = speechSynthesis.getVoices();
    
    // Priority order for female voices
    const femaleVoiceNames = [
      'Google हिन्दी', // Hindi female voice
      'Microsoft Heera - Hindi (India)',
      'Google UK English Female',
      'Microsoft Zira - English (United States)',
      'Google US English',
      'Microsoft Hazel - English (Great Britain)',
      'Alex', // macOS female voice
      'Samantha' // macOS female voice
    ];
    
    // First, try to find a specific female voice
    for (const voiceName of femaleVoiceNames) {
      const voice = voices.find(v => v.name.includes(voiceName));
      if (voice) return voice;
    }
    
    // Fallback: find any female voice (usually contains "Female" in name or has higher pitch indicators)
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('heera') ||
      voice.name.toLowerCase().includes('hazel') ||
      voice.name.toLowerCase().includes('samantha')
    );
    
    if (femaleVoice) return femaleVoice;
    
    // Last fallback: return the first available voice
    return voices.length > 0 ? voices[0] : null;
  }, []);
  
  // This is now our primary audio playback function
  const playStepAudio = useCallback((instruction: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) {
      setAudioState('idle');
      return;
    }

    // Stop any previous speech first
    stopAudio();
    
    // Wait a bit to ensure previous speech is fully stopped
    setTimeout(() => {
      if (!isSpeakingRef.current) {
        setSpeechError(null);
        isSpeakingRef.current = true;

        const utterance = new SpeechSynthesisUtterance(instruction);
        currentUtteranceRef.current = utterance;
        
        // Set voice to female if available
        const femaleVoice = getFemaleVoice();
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        
        utterance.rate = 0.85; // Slightly slower for emergency instructions
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
          if (isSpeakingRef.current) {
            setAudioState('playing');
          }
        };
        
        utterance.onend = () => {
          isSpeakingRef.current = false;
          currentUtteranceRef.current = null;
          setAudioState('idle');
        };
        
        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          isSpeakingRef.current = false;
          currentUtteranceRef.current = null;
          
          // Only show error if it's not an "interrupted" error (which is expected when stopping)
          if (event.error !== 'interrupted') {
            console.error("Speech synthesis error:", event.error);
            setSpeechError(`Audio Error: ${event.error}`);
          }
          setAudioState('idle');
        };
        
        try {
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.error("Error starting speech synthesis:", error);
          isSpeakingRef.current = false;
          currentUtteranceRef.current = null;
          setSpeechError('Failed to start audio playback');
          setAudioState('idle');
        }
      }
    }, 100); // 100ms delay to ensure clean transition
  }, [audioEnabled, stopAudio, getFemaleVoice]);

  // Effect to process the final transcript
  useEffect(() => {
    const processApiCall = async () => {
      if (!finalTranscript.trim()) return;

      setAppState('processing');
      try {
        const response = await fetch('/api/guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: finalTranscript,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to get a response from the AI.');
        }

        const scenario: EmergencyScenario = await response.json();
        
        setCurrentScenario(scenario);
        setCurrentStep(0);
        setAppState('guidance');
        
        // Auto-play first step audio with a longer delay to let UI fully render
        if (audioEnabled && scenario.steps && scenario.steps.length > 0) {
          setTimeout(() => {
            playStepAudio(scenario.steps[0].instruction);
          }, 500);
        }
      } catch (err: any) {
        setError(err.message);
        setAppState('idle');
      }
    };

    if (finalTranscript) {
      processApiCall();
    }
  }, [finalTranscript, audioEnabled, playStepAudio]);

  // Setup Web Speech API on component mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.lang = 'en-IN'; // Set to Indian English
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setAppState('listening');
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`Speech recognition error: ${event.error}`);
        setAppState('idle');
      };
      
      recognition.onend = () => {
        if (appState === 'listening') {
            setAppState('idle');
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const spokenText = event.results[0][0].transcript;
        setFinalTranscript(spokenText);
      };
    } else {
      setError("Your browser doesn't support speech recognition.");
    }

    // Load voices when they become available
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
      }
    };
    
    loadVoices();
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup function
    return () => {
      stopAudio();
      isSpeakingRef.current = false;
    };
  }, [appState, stopAudio]);

  const handleEmergencyButtonClick = () => {
    if (appState === 'idle' && recognitionRef.current) {
      setError('');
      setFinalTranscript('');
      stopAudio(); // Stop any playing audio
      recognitionRef.current.start();
    }
  };

  const handleNextStep = useCallback(() => {
    if (!currentScenario) return;
    
    stopAudio(); // Stop current audio
    
    if (currentStep < currentScenario.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Auto-play next step audio with delay
      if (audioEnabled) {
        setTimeout(() => {
          playStepAudio(currentScenario.steps[nextStep].instruction);
        }, 300);
      }
    } else {
      handleStartOver();
    }
  }, [currentScenario, currentStep, audioEnabled, playStepAudio, stopAudio]);

  const handleStartOver = useCallback(() => {
    stopAudio();
    setAppState('idle');
    setCurrentScenario(null);
    setCurrentStep(0);
    setFinalTranscript('');
    setError('');
    setSpeechError(null);
  }, [stopAudio]);

  // Audio Controls Component
  const AudioControls = ({ instruction }: { instruction: string; }) => (
    <div className="flex flex-col items-center justify-center gap-1 mt-4">
      <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-lg">
        <button
          onClick={() => playStepAudio(instruction)}
          disabled={audioState === 'playing'}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            audioState === 'playing'
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {audioState === 'playing' ? (
            <>🔊 Playing...</>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Replay
            </>
          )}
        </button>
        
        {audioState === 'playing' && (
          <button
            onClick={stopAudio}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            <Pause className="w-4 h-4" />
            Stop
          </button>
        )}
      </div>
      {speechError && (
        <p className="text-xs text-red-500">
          {speechError}
        </p>
      )}
    </div>
  );

  // --- UI Rendering ---
  const renderHomeScreen = () => {
    if (appState === 'guidance') return null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center p-4 relative">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-800">HelpNow AI</h1>
          </div>
          <p className="text-gray-600 font-medium">Your On-the-Spot Emergency Guide</p>
        </div>
        
        {/* Audio Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
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
          <EmergencyButton
            state={appState}
            onClick={handleEmergencyButtonClick}
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
          <div className="absolute top-5 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto" role="alert">
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError('')}
              className="text-xs underline mt-1 hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="absolute bottom-4 text-center">
          <button
            onClick={() => setShowDisclaimer(true)}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            Important Disclaimer
          </button>
        </div>
        <DisclaimerModal isOpen={showDisclaimer} onClose={() => setShowDisclaimer(false)} />
      </div>
    );
  };

  const renderGuidanceScreen = () => {
    if (!currentScenario) return null;
    const currentStepData = currentScenario.steps[currentStep];
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col p-4">
        <div className="text-center mb-6 pt-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{currentScenario.title}</h1>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleStartOver}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 underline transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </button>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
                audioEnabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              Audio {audioEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>
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
            
            {/* Audio Controls */}
            {audioEnabled && (
              <AudioControls 
                instruction={currentStepData.instruction} 
              />
            )}
          </div>
        </div>
        <div className="bg-red-500 text-white p-4 rounded-lg mt-6 text-center">
          <p className="font-bold">Remember: Call 108 for serious emergencies!</p>
        </div>
      </div>
    );
  };

  return <>{appState === 'guidance' ? renderGuidanceScreen() : renderHomeScreen()}</>;
}
