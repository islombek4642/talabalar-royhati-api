'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  requireInput?: boolean;
  inputPlaceholder?: string;
  expectedInput?: string;
  isDangerous?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Tasdiqlash',
  requireInput = false,
  inputPlaceholder = '',
  expectedInput = '',
  isDangerous = false
}: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError('');
    }

    // ESC key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireInput && expectedInput) {
      if (inputValue !== expectedInput) {
        setError('Tasdiq matni noto\'g\'ri!');
        return;
      }
    }
    onConfirm(inputValue);
  };

  const handleCancel = () => {
    setInputValue('');
    setError('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/10"
      onClick={handleCancel}
    >
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.4)] w-full max-w-md overflow-hidden animate-scale-in border-2 border-gray-300 ring-4 ring-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${isDangerous ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {isDangerous && (
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              )}
              <h3 className={`text-lg sm:text-xl font-bold ${isDangerous ? 'text-red-900' : 'text-gray-900'}`}>
                {title}
              </h3>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className={`text-sm whitespace-pre-line mb-4 ${isDangerous ? 'text-red-800' : 'text-gray-700'}`}>
            {message}
          </div>

          {requireInput && (
            <div className="space-y-2">
              <input
                id="confirm-input"
                name="confirmation_text"
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError('');
                }}
                autoComplete="off"
                placeholder={`Tasdiqlash uchun "${expectedInput}" deb yozing`}
                className={`w-full px-4 py-2 border-2 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'} rounded-lg focus:ring-2 font-mono`}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
              )}
              {expectedInput && (
                <p className="text-xs text-gray-500">
                  Kutilayotgan: <code className="bg-gray-100 px-2 py-1 rounded">{expectedInput}</code>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-sm sm:text-base"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all font-medium text-white text-sm sm:text-base ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-200'
                : 'bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
