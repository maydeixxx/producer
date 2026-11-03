import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, LayoutGrid, ListFilter, Sparkles, X, ArrowRight, User } from 'lucide-react';
import { Task, ExpertData } from '../types';
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
  currentTab?: string;
  onSearchSubmit?: () => void;
  tasks?: Task[];
  experts?: ExpertData[];
  onSelectTask?: (task: Task) => void;
  onSelectExpert?: (expert: ExpertData) => void;
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
  onQuickMeme,
  currentTab = 'tasks',
  onSearchSubmit,
  tasks = [],
  experts = [],
  onSelectTask,
  onSelectExpert
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSearchPlaceholder = () => {
    if (currentTab === 'tasks') return 'Поиск задач по названию...';
    if (currentTab === 'scout') return 'Поиск эксперта по нику...';
    return 'Поиск задач и экспертов (⌘K)...';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onSearchSubmit) {
        e.preventDefault();
        onSearchSubmit();
      }
    }
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Filter matching items for the dropdown
  const cleanQ = searchQuery.trim().toLowerCase().replace(/^@/, '');
  const matchingTasks = cleanQ
    ? tasks.filter(t => t.title.toLowerCase().includes(cleanQ) || (t.description && t.description.toLowerCase().includes(cleanQ))).slice(0, 5)
    : [];

  const matchingExperts = cleanQ
    ? experts.filter(e => e.nickname.toLowerCase().includes(cleanQ)).slice(0, 5)
    : [];

  const hasSuggestions = matchingTasks.length > 0 || matchingExperts.length > 0;

  return (
    <header className="h-16 border-b-2 border-border-strong bg-surface-0/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-sm">
      
      {/* Left Title & Counter */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-black italic tracking-tight text-white flex items-center gap-2.5 drop-shadow-sm">
          <span>{title}</span>
          {taskCount !== undefined && (
            <span className="text-xs font-mono font-medium not-italic text-zinc-300 bg-surface-100 border border-border-subtle px-2 py-0.5 rounded-full">
              {taskCount}
            </span>
          )}
        </h1>
        {subtitle && (
          <span className="hidden sm:inline text-xs text-zinc-300 border-l border-border-subtle pl-3 font-medium">
            {subtitle}
          </span>
        )}
      </div>

      {/* Center Search Bar with Dropdown Popup ("Слайдбар" выпадающий список) */}
      <div className="relative w-64 md:w-96 hidden sm:block" ref={containerRef}>
        <Search className="w-3.5 h-3.5 text-zinc-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setIsDropdownOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={getSearchPlaceholder()}
          className="w-full bg-surface-100 border border-border-subtle focus:border-zinc-300 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none transition"
        />
        {searchQuery.trim() && (
          <button
            onClick={() => {
              playTick();
              setSearchQuery('');
              setIsDropdownOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-white transition"
            title="Очистить поиск"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Dropdown Suggestions Menu */}
        {isDropdownOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 panel bg-surface-100 rounded-xl shadow-2xl border border-border-subtle p-2 max-h-96 overflow-y-auto space-y-2">
            
            {/* Matching Tasks Section */}
            {matchingTasks.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-300 px-2 py-1 font-bold flex items-center justify-between">
                  <span>Задачи ({matchingTasks.length})</span>
                  <span className="text-[9px] text-zinc-400 font-normal">клик — открыть меню задачи</span>
                </div>
                {matchingTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      playTick();
                      setIsDropdownOpen(false);
                      if (onSelectTask) onSelectTask(t);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-200 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        t.taskPriority === 'HIGH' ? 'bg-accent-red animate-pulse' :
                        t.taskPriority === 'MEDIUM' ? 'bg-accent-orange' : 'bg-zinc-400'
                      }`} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white group-hover:text-accent-orange transition truncate">
                          {t.title}
                        </div>
                        <div className="text-[10px] text-zinc-300 font-mono flex items-center gap-2 mt-0.5">
                          <span>{t.taskType === 'UNIVERSITY' ? '🎓 Универ' : t.taskType === 'LAUNCH' ? '💼 Запуск' : '🐗 Личное'}</span>
                          <span>•</span>
                          <span className={t.taskStatus === 'DONE' ? 'text-accent-green' : t.taskStatus === 'PROCESSING' ? 'text-accent-orange' : 'text-zinc-400'}>
                            {t.taskStatus}
                          </span>
                          <span>•</span>
                          <span>До {t.deadline || 'дедлайна'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-accent-orange opacity-0 group-hover:opacity-100 transition shrink-0 ml-2 flex items-center gap-0.5">
                      <span>Открыть</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Matching Experts Section */}
            {matchingExperts.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-border-subtle">
                <div className="text-[10px] font-mono uppercase text-zinc-300 px-2 py-1 font-bold flex items-center justify-between">
                  <span>Эксперты ({matchingExperts.length})</span>
                  <span className="text-[9px] text-zinc-400 font-normal">клик — открыть досье</span>
                </div>
                {matchingExperts.map((exp) => (
                  <div
                    key={exp.id || exp.nickname}
                    onClick={() => {
                      playTick();
                      setIsDropdownOpen(false);
                      if (onSelectExpert) onSelectExpert(exp);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-200 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded bg-surface-200 border border-border-subtle flex items-center justify-center text-xs font-bold text-accent-orange shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-accent-orange transition truncate">
                          @{exp.nickname}
                        </div>
                        <div className="text-[10px] text-zinc-300 font-mono truncate">
                          Охваты: {exp.coverage ? exp.coverage.toLocaleString() : '—'} • Болей: {exp.needs?.length || 0}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-accent-orange opacity-0 group-hover:opacity-100 transition shrink-0 ml-2 flex items-center gap-0.5">
                      <span>Досье</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!hasSuggestions && (
              <div className="p-3 text-center text-xs text-zinc-300 space-y-1">
                <div>Ничего не найдено по запросу «<span className="text-accent-orange font-semibold">{searchQuery}</span>»</div>
                <div className="text-[10px] text-zinc-400">Нажмите Enter для отправки запроса на бэкенд</div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        
        {/* Kanban vs List Switcher */}
        {currentTab === 'tasks' && (
          <div className="flex items-center bg-surface-100 p-0.5 rounded-lg border border-border-subtle">
            <button
              onClick={() => {
                playTick();
                setViewMode('kanban');
              }}
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'kanban'
                  ? 'bg-surface-300 text-white shadow-sm'
                  : 'text-zinc-300 hover:text-white'
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
                  : 'text-zinc-300 hover:text-white'
              }`}
              title="Линейный список"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-[#1f1818] text-xs font-bold transition flex items-center gap-1.5 shadow active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Новая задача</span>
          </button>
        )}

      </div>

    </header>
  );
};
