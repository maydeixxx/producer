import React from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  Palette, 
  Search, 
  Users, 
  Flame, 
  GraduationCap, 
  Briefcase, 
  Volume2, 
  Wine 
} from 'lucide-react';
import { playTick, triggerKlaxon, triggerBeerToast } from './AudioSynthesizer';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  taskFilter: string;
  setTaskFilter: (filter: string) => void;
  taskCounts: {
    total: number;
    urgent: number;
    university: number;
    launch: number;
    self: number;
  };
  backendStatus: {
    task: boolean;
    scan: boolean;
  };
  currentPersonaImg: string;
  onCyclePersona: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  taskFilter,
  setTaskFilter,
  taskCounts,
  backendStatus,
  currentPersonaImg,
  onCyclePersona,
}) => {
  const handleNavClick = (tab: string) => {
    playTick();
    setCurrentTab(tab);
  };

  const handleFilterClick = (filter: string) => {
    playTick();
    setCurrentTab('tasks');
    setTaskFilter(filter);
  };

  return (
    <aside className="w-64 bg-surface-50 border-r-2 border-border-strong flex flex-col justify-between shrink-0 select-none h-screen sticky top-0 shadow-lg">
      
      {/* Top Branding */}
      <div>
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div 
            onClick={() => handleNavClick('tasks')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img 
                src={currentPersonaImg} 
                alt="Кабан" 
                className="w-8 h-8 rounded-lg object-cover border border-border-subtle group-hover:border-accent-orange transition" 
              />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-green border-2 border-surface-50" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight">ProducerOS</span>
                <span className="text-[9px] font-mono text-accent-orange bg-orange-950/40 border border-orange-900/60 px-1 py-0.2 rounded font-semibold">Pro</span>
              </div>
              <div className="text-[10px] text-zinc-300 font-mono">Штаб Кабана</div>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="p-3 space-y-6 overflow-y-auto">
          
          {/* Main Views */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-400 px-2.5 py-1 tracking-wider font-semibold">
              Задачи & Проекты
            </div>

            <button
              onClick={() => handleFilterClick('ALL')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentTab === 'tasks' && taskFilter === 'ALL'
                  ? 'bg-surface-300 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-surface-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-zinc-300" />
                <span>Все задачи</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">{taskCounts.total}</span>
            </button>

            <button
              onClick={() => handleFilterClick('URGENT')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentTab === 'tasks' && taskFilter === 'URGENT'
                  ? 'bg-red-950/40 text-accent-red border border-red-900/50 font-semibold'
                  : 'text-zinc-300 hover:text-accent-red hover:bg-surface-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-accent-red animate-pulse" />
                <span className="text-accent-red font-semibold">Горят дедлайны</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-accent-red/25 text-accent-red px-1.5 py-0.5 rounded">
                {taskCounts.urgent}
              </span>
            </button>

            <button
              onClick={() => handleFilterClick('UNIVERSITY')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentTab === 'tasks' && taskFilter === 'UNIVERSITY'
                  ? 'bg-surface-300 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-surface-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                <span>Универ</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">{taskCounts.university}</span>
            </button>

            <button
              onClick={() => handleFilterClick('LAUNCH')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentTab === 'tasks' && taskFilter === 'LAUNCH'
                  ? 'bg-surface-300 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-surface-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-accent-orange" />
                <span>Запуск</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">{taskCounts.launch}</span>
            </button>
          </div>

          {/* Vladik Ecosystem Modules */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-400 px-2.5 py-1 tracking-wider font-semibold">
              Мемология & AI
            </div>

            <button
              onClick={() => handleNavClick('memes')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentTab === 'memes'
                  ? 'bg-surface-300 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-surface-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                <span>Мемотека</span>
              </div>
              <span className="text-[9px] font-mono bg-accent-orange/20 text-accent-orange px-1 rounded font-bold">HOT</span>
            </button>

            <button
              onClick={() => handleNavClick('generator')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentTab === 'generator'
                  ? 'bg-surface-300 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-surface-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-accent-purple" />
              <span>Мемогенератор</span>
            </button>

            <button
              onClick={() => handleNavClick('scout')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentTab === 'scout'
                  ? 'bg-surface-300 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-surface-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-accent-blue" />
              <span>InstaScout AI</span>
            </button>

            <button
              onClick={() => handleNavClick('roster')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentTab === 'roster'
                  ? 'bg-surface-300 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-surface-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-zinc-300" />
              <span>Кентос-Хаб (33 ипостаси)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Status & Quick Sound Bites */}
      <div className="p-3 border-t border-border-subtle space-y-3 bg-surface-50">
        
        {/* Quick Audio Controls */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              playTick();
              triggerKlaxon();
            }}
            className="px-2 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 border border-border-subtle text-[11px] font-mono text-zinc-300 transition flex items-center justify-center gap-1.5 active:scale-95 hover:border-accent-orange"
            title="Подать звуковой сигнал 140 dB"
          >
            <Volume2 className="w-3.5 h-3.5 text-accent-orange" />
            <span>Клаксон</span>
          </button>

          <button
            onClick={() => {
              playTick();
              triggerBeerToast();
            }}
            className="px-2 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 border border-border-subtle text-[11px] font-mono text-zinc-300 transition flex items-center justify-center gap-1.5 active:scale-95"
            title="Тост со Сэром Похмельем"
          >
            <Wine className="w-3.5 h-3.5 text-accent-yellow" />
            <span>Тост</span>
          </button>
        </div>

        {/* System Status */}
        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-300 bg-surface-200 px-3 py-2 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${backendStatus.task && backendStatus.scan ? 'bg-accent-green' : 'bg-accent-orange'}`} />
            <span className="text-zinc-200 font-sans">
              {backendStatus.task && backendStatus.scan ? 'Сервисы активны' : 'Синхронизация'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-300 font-mono">v1.2</span>
        </div>

        {/* Vladik Interactive Pill */}
        <div 
          onClick={onCyclePersona}
          className="flex items-center justify-between p-2 rounded-lg panel hover:border-zinc-400 cursor-pointer transition group"
          title="Кликни, чтобы сменить образ Владика"
        >
          <div className="flex items-center gap-2">
            <img 
              src={currentPersonaImg} 
              alt="Владик" 
              className="w-6 h-6 rounded-md object-cover border border-border-subtle group-hover:scale-105 transition"
            />
            <div className="text-left">
              <div className="text-[11px] font-bold text-zinc-200 group-hover:text-white leading-none">Владик</div>
              <div className="text-[9px] text-accent-orange font-mono">Кабан ебаный</div>
            </div>
          </div>
          <span className="text-zinc-400 group-hover:text-zinc-200 text-xs">↻</span>
        </div>

      </div>

    </aside>
  );
};
