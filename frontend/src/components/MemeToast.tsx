import React, { useEffect } from 'react';
import { MemeReaction } from '../types';

interface MemeToastProps {
  reaction: MemeReaction | null;
  onClose: () => void;
}

export const MemeToast: React.FC<MemeToastProps> = ({ reaction, onClose }) => {
  useEffect(() => {
    if (!reaction) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [reaction, onClose]);

  if (!reaction) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 panel p-3.5 rounded-xl border border-zinc-700 shadow-2xl flex items-center gap-3.5 max-w-sm bg-[#101015] animate-in slide-in-from-bottom-5 duration-300">
      <img
        src={reaction.img}
        alt="Владик"
        className="w-12 h-12 rounded-lg object-cover border border-zinc-600 shrink-0 shadow"
      />
      <div className="space-y-0.5">
        <div className="text-xs font-bold text-accent-orange font-mono">
          {reaction.title}
        </div>
        <div className="text-[11px] text-zinc-300 italic leading-snug">
          {reaction.quote}
        </div>
      </div>
    </div>
  );
};
