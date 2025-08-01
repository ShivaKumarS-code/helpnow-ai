'use client'

import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface GuideCardProps {
  step: number;
  totalSteps: number;
  instruction: string;
  type: 'warning' | 'action' | 'info';
  onNextStep: () => void;
  isLastStep?: boolean;
}

export const GuideCard: React.FC<GuideCardProps> = ({
  step,
  totalSteps,
  instruction,
  type,
  onNextStep,
  isLastStep = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'action':
        return <ArrowRight className="w-8 h-8 text-blue-500" />;
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
      default:
        return 'border-green-500';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 ${getCardBorder()} animate-fadeIn`}>
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