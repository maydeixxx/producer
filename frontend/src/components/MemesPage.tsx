import React, { useState } from 'react';
import { Heart, Volume2, Edit3 } from 'lucide-react';
import { CURATED_MEMES } from './memeData';
import { MemeItem } from '../types';
import { playTick, triggerKlaxon, triggerBoarRoar, triggerBeerToast } from './AudioSynthesizer';

interface MemesPageProps {
  onOpenInStudio: (meme: MemeItem) => void;
  onShowReaction: (img: string, title: string, quote: string) => void;
}

export const MemesPage: React.FC<MemesPageProps> = ({ onOpenInStudio, onShowReaction }) => {
  const [memes, setMemes] = useState<MemeItem[]>(CURATED_MEMES);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const handleLike = (id: number) => {
    playTick();
    setMemes(prev => prev.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m));
  };

  const playMemeSound = (category: MemeItem['category'], meme: MemeItem) => {
    if (category === 'kaban') triggerBoarRoar();
    else if (category === 'pohmel') triggerBeerToast();
    else triggerKlaxon();

    onShowReaction(meme.photo, meme.topText, `«${meme.bottomText}»`);
  };

  const filtered = categoryFilter === 'ALL' 
    ? memes 
    : memes.filter(m => m.category === categoryFilter);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-white">Мемный Зал Славы Владика</h2>
            <span className="badge bg-accent-orange text-black font-mono font-bold text-[10px]">
              {CURATED_MEMES.length} МЕМОВ
            </span>
          </div>
          <p className="text-xs text-zinc-300 mt-1 max-w-xl">
            Все {CURATED_MEMES.length} фотографий твоего кента, упакованные в классические демотиваторы и Impact-форматы. Кликай на звук, лайкай и открывай в мемогенераторе.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => { playTick(); setCategoryFilter('ALL'); }}
            className={`px-3 py-1.5 rounded-lg transition ${categoryFilter === 'ALL' ? 'bg-surface-300 text-white font-semibold' : 'text-zinc-300 hover:text-white bg-surface-100'}`}
          >
            Все ({CURATED_MEMES.length})
          </button>
          <button
            onClick={() => { playTick(); setCategoryFilter('kaban'); }}
            className={`px-3 py-1.5 rounded-lg transition ${categoryFilter === 'kaban' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white bg-surface-100'}`}
          >
            🐗 Кабан
          </button>
          <button
            onClick={() => { playTick(); setCategoryFilter('shvabra'); }}
            className={`px-3 py-1.5 rounded-lg transition ${categoryFilter === 'shvabra' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white bg-surface-100'}`}
          >
            📢 Швабра & Гудок
          </button>
          <button
            onClick={() => { playTick(); setCategoryFilter('dron'); }}
            className={`px-3 py-1.5 rounded-lg transition ${categoryFilter === 'dron' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white bg-surface-100'}`}
          >
            🛸 Дрон
          </button>
          <button
            onClick={() => { playTick(); setCategoryFilter('pohmel'); }}
            className={`px-3 py-1.5 rounded-lg transition ${categoryFilter === 'pohmel' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white bg-surface-100'}`}
          >
            🍺 Похмелье
          </button>
        </div>
      </div>

      {/* Grid of 12 Memes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(m => (
          <div 
            key={m.id}
            className="panel p-4 rounded-xl space-y-3 demotivator-frame group hover:border-accent-orange transition duration-300"
          >
            {/* Top Text */}
            <div className="meme-text-stroke text-sm text-center leading-tight">
              {m.topText}
            </div>

            {/* Photo */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900 border border-zinc-700">
              <img
                src={m.photo}
                alt="Владик"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <span className="absolute top-2 left-2 badge bg-black/80 text-accent-orange border border-zinc-700 font-mono text-[9px]">
                {m.tag}
              </span>
            </div>

            {/* Bottom Text */}
            <div className="meme-text-stroke text-sm text-center text-accent-yellow leading-tight">
              {m.bottomText}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs font-mono text-zinc-400">
              <button
                onClick={() => handleLike(m.id)}
                className="flex items-center gap-1.5 hover:text-white transition px-2 py-1 rounded bg-surface-100"
              >
                <Heart className="w-3.5 h-3.5 text-accent-red fill-accent-red" />
                <span>{m.likes.toLocaleString()}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => playMemeSound(m.category, m)}
                  className="hover:text-accent-orange transition p-1.5 rounded bg-surface-100"
                  title="Озвучить мем"
                >
                  <Volume2 className="w-3.5 h-3.5 text-zinc-400 hover:text-accent-orange" />
                </button>
                <button
                  onClick={() => onOpenInStudio(m)}
                  className="text-zinc-300 hover:text-white text-[11px] underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Студия</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
