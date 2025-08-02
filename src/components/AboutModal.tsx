'use client'

import { X, Users } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800">About HelpNow AI</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Team CodeX</h3>
              <p className="text-sm text-gray-600 mb-4">This project was developed by us</p>
              
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-800">Shiva Kumar S</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-800">Ruthvik MT</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-800">Pratham R Shetty</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-800">Sanjay UG</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-6">
              <p className="text-sm text-gray-600 text-center">
                HelpNow AI is designed to provide immediate first aid guidance in emergency situations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};