'use client'

import { useState } from 'react';
import { Send } from 'lucide-react';

interface TextInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onSubmit, disabled = false }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !disabled) {
      onSubmit(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-sm text-gray-600 mb-2 text-center">
        Speak your emergency clearly, or type it below
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Describe your emergency..."
          disabled={disabled}
          className="themed-input flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || disabled}
          className="bg-gray-700 hover:bg-gray-900 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};