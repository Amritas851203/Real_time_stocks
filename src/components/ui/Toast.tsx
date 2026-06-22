'use client';

import React from 'react';
import { useUiStore } from '../../store/useUiStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast, showToast } = useUiStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
    error: 'border-rose-500/20 bg-rose-950/20 text-rose-300',
    info: 'border-sky-500/20 bg-sky-950/20 text-sky-300',
  };

  return (
    <div className="fixed top-20 left-4 right-4 md:top-auto md:left-auto md:bottom-6 md:right-6 z-50 animate-slide-left select-none">
      <div
        className={`flex items-center space-x-3 border rounded-lg px-4 py-3 shadow-2xl backdrop-blur-md ${
          borders[toast.type]
        } w-full md:max-w-sm`}
      >
        {icons[toast.type]}
        <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
        <button
          onClick={() => useUiStore.setState({ toast: null })}
          className="text-gray-400 hover:text-white p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
