'use client'

import { CheckCircle, AlertTriangle, ArrowRight, Info, ImageOff } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GuideCardProps {
  step: number;
  totalSteps: number;
  instruction: string;
  type: 'warning' | 'action' | 'info';
  visualUrl?: string;
  alternativeUrls?: string[];
  onNextStep: () => void;
  isLastStep?: boolean;
}

export const GuideCard: React.FC<GuideCardProps> = ({
  step,
  totalSteps,
  instruction,
  type,
  visualUrl,
  alternativeUrls = [],
  onNextStep,
  isLastStep = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- FIX: Reset loading and error states when the step changes ---
  useEffect(() => {
    setIsLoading(true);
    setImageError(false);
    setCurrentUrlIndex(0);
  }, [step]); // Dependency array now only watches for step changes for simplicity

  const allImageUrls = [
    visualUrl,
    ...alternativeUrls
  ].filter((url): url is string => !!url); // Filter out any undefined/null values and assert type

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'action':
        return <ArrowRight className="w-8 h-8 text-blue-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-gray-500" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  const getCardBorder = () => {
    switch (type) {
      case 'warning':
        return 'border-yellow-500';
      case 'action':
        return 'border-blue-500';
      case 'info':
        return 'border-gray-500';
      default:
        return 'border-green-500';
    }
  };

  const handleImageError = () => {
    const currentUrl = allImageUrls[currentUrlIndex];
    console.log('Image failed to load:', currentUrl);
    
    // Try next URL if available
    if (currentUrlIndex < allImageUrls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
      setIsLoading(true); // Reset loading for the next attempt
      return;
    }
    
    // If all URLs failed, show error state
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    const currentUrl = allImageUrls[currentUrlIndex];
    console.log('Image loaded successfully:', currentUrl);
    setIsLoading(false);
    setImageError(false);
  };

  const currentImageSrc = allImageUrls[currentUrlIndex];

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${getCardBorder()} animate-fadeIn`}>
      <div className="flex items-start gap-4 mb-4">
        {getIcon()}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              STEP {step} OF {totalSteps}
            </span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">{instruction}</p>
        </div>
      </div>
      
      <button
        onClick={onNextStep}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isLastStep ? 'COMPLETE GUIDE' : 'NEXT STEP'}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
