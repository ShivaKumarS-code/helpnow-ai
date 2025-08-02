'use client'

import { X, AlertTriangle } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-800">Important Disclaimer</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p className="font-semibold text-red-600">
              This app is for informational purposes only and is not a substitute for professional medical advice.
            </p>
            
            <p>
              In a real emergency, always call your local emergency services (911, 999, 112, etc.) immediately.
            </p>
            
            <p>
              The guidance provided by this app should not replace proper first aid training or professional medical care. Always seek qualified medical assistance for serious injuries or conditions.
            </p>
            
            <p>
              By using this app, you acknowledge that the developers are not responsible for any actions taken based on the information provided.
            </p>
            
            <p className="text-sm text-gray-500">
              This app is designed to provide basic first aid guidance while you wait for professional help to arrive.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-6 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};