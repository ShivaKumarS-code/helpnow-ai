'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type AudioState = 'idle' | 'playing' | 'paused';

export const useTextToSpeech = () => {
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getFemaleVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return null;
    const voices = speechSynthesis.getVoices();
    const femaleVoiceNames = [
      'Google हिन्दी',
      'Microsoft Heera - Hindi (India)',
      'Google UK English Female',
      'Microsoft Zira - English (United States)',
      'Google US English',
      'Microsoft Hazel - English (Great Britain)',
      'Samantha',
    ];
    for (const voiceName of femaleVoiceNames) {
      const voice = voices.find(v => v.name.includes(voiceName));
      if (voice) return voice;
    }
    return voices.find(v => v.name.toLowerCase().includes('female')) || voices[0] || null;
  }, []);

  const play = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.error("Browser doesn't support speech synthesis.");
      return;
    }
    speechSynthesis.cancel(); // Cancel any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    const femaleVoice = getFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.rate = 0.85;
    utterance.pitch = 1.1;

    utterance.onstart = () => setAudioState('playing');
    utterance.onend = () => setAudioState('idle');
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.error("Speech synthesis error:", e.error);
      }
      setAudioState('idle');
    };

    speechSynthesis.speak(utterance);
  }, [getFemaleVoice]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setAudioState('idle');
  }, []);
  
  // Load voices when they become available
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
      }
    };
    loadVoices();
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
        stop();
      }
    };
  }, [stop]);

  return { play, stop, audioState };
};
