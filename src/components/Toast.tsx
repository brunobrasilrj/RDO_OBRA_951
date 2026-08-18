import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl z-50 transition-all duration-300 flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
