'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export default function Drawer({ isOpen, onClose, title, children, size = 'md' }: DrawerProps) {
  // Listen for Escape key to close the drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in cursor-pointer"
        onClick={(e) => {
          console.log("[DEBUG] Drawer backdrop clicked");
          e.stopPropagation();
          onClose();
        }}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        {/* Sliding panel */}
        <div
          className={`w-screen ${sizeClasses[size]} bg-[#0d1117] border-l border-[#21262d] flex flex-col shadow-2xl h-full animate-slide-left`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#21262d] flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-100 tracking-wide">{title}</h2>
            <button
              type="button"
              onClick={(e) => {
                console.log("[DEBUG] Drawer close button clicked");
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded bg-[#161b22] hover:bg-[#30363d] text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
