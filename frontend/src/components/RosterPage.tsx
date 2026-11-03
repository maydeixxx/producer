import React from 'react';
import { Volume2, RefreshCw } from 'lucide-react';
import { PERSONAS } from './memeData';
import { PersonaItem } from '../types';
import { playTick, triggerKlaxon } from './AudioSynthesizer';

interface RosterPageProps {
  onSelectPersona: (persona: PersonaItem) => void;
}

export const RosterPage: React.FC<RosterPageProps> = ({ onSelectPersona }) => {
  const handleRandomize = () => {
    playTick();
    const rand = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    onSelectPersona(rand);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🐗 Кентос-Хаб: 33 боевые ипостаси Владика</span>
          </h2>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            Все персонажи разблокированы. Кликни по карточке, чтобы включить его личный режим в шапке.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 border border-border-subtle text-xs text-zinc-300 font-mono transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Случайный кент</span>
          </button>
          <button
            onClick={triggerKlaxon}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-mono transition border border-zinc-700 flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5 text-accent-orange" />
            <span>Клаксон (140 dB)</span>
          </button>
        </div>
      </div>

      {/* 12 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {PERSONAS.map(p => (
          <div
            key={p.id}
            onClick={() => {
              playTick();
              onSelectPersona(p);
            }}
            className="panel p-3.5 rounded-xl space-y-2.5 hover:border-zinc-500 transition cursor-pointer group"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-600 transition">
              <img
                src={p.img}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-2 left-2 badge bg-black/80 text-zinc-300 border border-zinc-700 backdrop-blur-sm font-mono text-[9px]">
                {p.badge}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-white truncate group-hover:text-accent-orange transition">
                {p.title}
              </div>
              <p className="text-[11px] text-zinc-400 italic line-clamp-2 leading-relaxed">
                {p.quote}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
              <span>{p.stat}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerKlaxon();
                }}
                className="text-zinc-400 hover:text-white"
                title="Гудок"
              >
                📢
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
