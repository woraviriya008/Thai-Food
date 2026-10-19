import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#2A2421] text-white shadow-xl border border-white/10 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-[#C85A32] text-white flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
      </div>
      <p className="text-xs sm:text-sm font-medium">{message}</p>
    </div>
  );
};
