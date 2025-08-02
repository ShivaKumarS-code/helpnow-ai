'use client'

import { CheckCircle, AlertTriangle, ArrowRight, Info, ImageOff, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GuideCardProps {
  step: number;
  totalSteps: number;
  instruction: string;
  type: 'warning' | 'action' | 'info';
  visualUrl?: string;
  alternativeUrls?: string[];
  onNextStep: () => void;
  onPreviousStep: () => void;
  isLastStep?: boolean;
  isFirstStep?: boolean;
}

export const GuideCard: React.FC<GuideCardProps> = ({
  step,
  totalSteps,
  instruction,
  type,
  visualUrl,
  alternativeUrls = [],
  onNextStep,
  onPreviousStep,
  isLastStep = false,
  isFirstStep = false
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
    <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 ${getCardBorder()} animate-fadeIn`}>
      
      {/* --- RESTORED: Visual Display Area --- */}
      {allImageUrls.length > 0 ? (
        <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden flex justify-center items-center min-h-[200px] relative border border-gray-200">
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading image...</span>
            </div>
          )}
          
          {imageError && (
            <div className="flex flex-col items-center justify-center text-gray-500 p-8">
              <ImageOff className="w-12 h-12 mb-2" />
              <p className="text-sm">Visual guide unavailable</p>
            </div>
          )}
          
          {!imageError && currentImageSrc && (
            <img 
              key={`${currentImageSrc}-${step}`}
              src={currentImageSrc}
              alt={`Visual guide for: ${instruction}`} 
              className={`w-full max-h-60 object-fill transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      ) : null}

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
      
      <div className="flex items-center justify-between gap-2 mt-4">
        <button
          onClick={onPreviousStep}
          disabled={isFirstStep}
          className="w-1/3 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          PREVIOUS
        </button>
        <button
          onClick={onNextStep}
          className="w-2/3 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLastStep ? 'COMPLETE GUIDE' : 'NEXT STEP'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};




