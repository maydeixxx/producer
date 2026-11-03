import React from 'react';
import { Search, Plus, LayoutGrid, ListFilter, Sparkles } from 'lucide-react';
import { playTick } from './AudioSynthesizer';

interface HeaderProps {
  title: string;
  subtitle?: string;
  taskCount?: number;
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCreateModal?: () => void;
  onQuickMeme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  taskCount,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onOpenCreateModal,
  onQuickMeme
}) => {
  return (
    <header className="h-14 border-b border-border-subtle bg-surface-50/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      
      {/* Left Title & Counter */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
          {taskCount !== undefined && (
            <span className="text-xs font-mono text-zinc-400 font-normal">
              ({taskCount})
            </span>
          )}
        </h1>
        {subtitle && (
          <span className="hidden sm:inline text-xs text-zinc-400 border-l border-border-subtle pl-3">
            {subtitle}
          </span>
        )}
      </div>

      {/* Center Search Bar */}
      <div className="relative w-64 md:w-80 hidden sm:block">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по задачам и проектам (⌘K)..."
          className="w-full bg-surface-100 border border-border-subtle focus:border-zinc-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        
        {/* Kanban vs List Switcher */}
        <div className="flex items-center bg-surface-100 p-0.5 rounded-lg border border-border-subtle">
          <button
            onClick={() => {
              playTick();
              setViewMode('kanban');
            }}
            className={`p-1.5 rounded-md text-xs transition ${
              viewMode === 'kanban'
                ? 'bg-surface-300 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Канбан-доска"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              playTick();
              setViewMode('list');
            }}
            className={`p-1.5 rounded-md text-xs transition ${
              viewMode === 'list'
                ? 'bg-surface-300 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Линейный список"
          >
            <ListFilter className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Meme Button */}
        {onQuickMeme && (
          <button
            onClick={() => {
              playTick();
              onQuickMeme();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 border border-border-subtle text-xs font-mono text-accent-orange transition hidden md:flex items-center gap-1.5"
            title="Мем дня"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
            <span className="text-[11px] font-semibold">Мем дня</span>
          </button>
        )}

        {/* Create Task Button */}
        {onOpenCreateModal && (
          <button
            onClick={() => {
              playTick();
              onOpenCreateModal();
            }}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition flex items-center gap-1.5 shadow active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Новая задача</span>
          </button>
        )}

      </div>

    </header>
  );
};
