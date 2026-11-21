import React from 'react';
import { 
  Flame, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Edit3,
  Plus
} from 'lucide-react';
import { Task, TaskType } from '../types';
import { playTick } from './AudioSynthesizer';
import { getAssetUrl } from '../utils/assets';

interface TasksPageProps {
  tasks: Task[];
  viewMode: 'kanban' | 'list';
  filter: string;
  searchQuery: string;
  onUpdateStatus: (id: string, newStatus: Task['taskStatus']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onOpenCreateModal: () => void;
  onClearSearch?: () => void;
  isLoading?: boolean;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  filter,
  searchQuery,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
  onClearSearch,
  isLoading
}) => {
  // Filter logic
  const filteredTasks = tasks.filter(t => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    // Category filter
    if (filter === 'URGENT') {
      return t.taskPriority === 'HIGH' && t.taskStatus !== 'DONE';
    }
    if (filter !== 'ALL' && t.taskType !== filter) {
      return false;
    }
    return true;
  });

  const getTaskAvatar = (t: Task): string => {
    if (t.taskType === 'UNIVERSITY') return getAssetUrl('/assets/vlad_2.jpg'); // Швабра
    if (t.taskType === 'LAUNCH') return getAssetUrl('/assets/vlad_1.jpg'); // Кабан
    if (t.taskPriority === 'HIGH') return getAssetUrl('/assets/vlad_6.jpg'); // Клаксон
    return getAssetUrl('/assets/vlad_11.jpg'); // Аналитик Влад
  };

  const getPersonaName = (t: Task): string => {
    if (t.taskType === 'UNIVERSITY') return 'Погоняло Швабра';
    if (t.taskType === 'LAUNCH') return 'Кабан ебаный';
    if (t.taskPriority === 'HIGH') return 'Клаксон 140dB';
    return 'Аналитик Влад';
  };

  const getTypeBadge = (type: TaskType) => {
    switch (type) {
      case 'UNIVERSITY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
            🎓 Универ
          </span>
        );
      case 'LAUNCH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/20">
            💼 Запуск
          </span>
        );
      case 'SELF':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/20">
            🐗 Личное
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Task['taskPriority']) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">
            ● HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
            ● MED
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            ○ LOW
          </span>
        );
    }
  };

  // Urgent top task
  const urgentTask = tasks.find(t => t.taskPriority === 'HIGH' && t.taskStatus !== 'DONE');

  if (!isLoading && tasks.length === 0) {
    return (
      <div className="panel p-10 rounded-xl text-center space-y-4 border border-dashed border-border-subtle bg-surface-100 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-center mx-auto text-2xl shadow">
          🐗
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            {searchQuery.trim() ? 'Задачи не найдены' : 'Список задач пуст'}
          </h3>
          <p className="text-xs text-zinc-400">
            {searchQuery.trim()
              ? `По запросу «${searchQuery}» ничего нет.`
              : 'Создайте первую задачу, чтобы наполнить канбан-доску.'}
          </p>
        </div>
        {searchQuery.trim() && onClearSearch ? (
          <button
            onClick={onClearSearch}
            className="px-4 py-2 rounded-lg bg-surface-200 hover:bg-surface-300 border border-border-subtle text-white text-xs font-semibold transition"
          >
            Сбросить поиск
          </button>
        ) : (
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition shadow"
          >
            + Создать задачу
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Notion Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl select-none">🐗</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Задачи Кабана</span>
              <span className="text-xs font-mono font-medium text-zinc-400 bg-surface-100 border border-border-subtle px-2 py-0.5 rounded-full">
                {filteredTasks.length}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Канбан-доска проектов, учебы и запусков
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTick();
              onOpenCreateModal();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-[#191919] text-xs font-bold transition flex items-center gap-1.5 shadow active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Новая задача</span>
          </button>
        </div>
      </div>

      {/* Urgent Alert Banner */}
      {urgentTask && (
        <div className="p-3.5 rounded-xl panel border-l-4 border-l-accent-red flex items-center justify-between gap-4 bg-red-950/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-red-900/40 text-accent-red shrink-0">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-accent-red flex items-center gap-2">
                <span>🔥 Срочный дедлайн</span>
                <span className="text-zinc-400 font-normal hidden sm:inline">• {urgentTask.deadline || 'Сегодня'}</span>
              </div>
              <div className="text-xs text-white truncate font-medium">
                {urgentTask.title}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                playTick();
                onUpdateStatus(urgentTask.id, 'PROCESSING');
              }}
              className="px-3 py-1.5 rounded-lg bg-accent-orange hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <span>В работу</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                playTick();
                onEditTask(urgentTask);
              }}
              className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-zinc-200 text-xs font-medium transition"
            >
              Детали
            </button>
          </div>
        </div>
      )}

      {/* NOTION KANBAN BOARD CANVAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        
        {/* ================= COLUMN 1: TODO ================= */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span>В очереди</span>
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {filteredTasks.filter(t => t.taskStatus === 'TODO').length}
              </span>
            </div>
            <button
              onClick={() => {
                playTick();
                onOpenCreateModal();
              }}
              className="p-1 text-zinc-400 hover:text-white hover:bg-surface-100 rounded transition"
              title="Добавить задачу"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 min-h-[350px]">
            {filteredTasks
              .filter(t => t.taskStatus === 'TODO')
              .map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    playTick();
                    onEditTask(t);
                  }}
                  className="p-3.5 rounded-xl bg-surface-100 border border-border-subtle hover:border-zinc-500 hover:-translate-y-0.5 transition cursor-pointer shadow-sm space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-white leading-snug group-hover:text-accent-orange transition">
                      {t.title}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          playTick();
                          onEditTask(t);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-surface-200 transition"
                        title="Редактировать"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить задачу «${t.title}»?`)) onDeleteTask(t.id);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-accent-red hover:bg-surface-200 transition"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {t.description && (
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}

                  {/* Notion Property Rows */}
                  <div className="space-y-1.5 text-[11px] pt-2 border-t border-border-subtle">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Приоритет</span>
                      {getPriorityBadge(t.taskPriority)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Категория</span>
                      {getTypeBadge(t.taskType)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Ответственный</span>
                      <span className="inline-flex items-center gap-1.5 text-zinc-200 font-medium">
                        <img src={getTaskAvatar(t)} alt="Владик" className="w-4 h-4 rounded-full object-cover border border-zinc-700" />
                        <span className="text-[10.5px]">{getPersonaName(t)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Deadline + Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[10px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{t.deadline || 'Без срока'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTick();
                        onUpdateStatus(t.id, 'PROCESSING');
                      }}
                      className="text-accent-orange hover:underline font-semibold flex items-center gap-1 hover:text-orange-400 transition"
                    >
                      <span>В работу</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

            {filteredTasks.filter(t => t.taskStatus === 'TODO').length === 0 && (
              <div className="h-32 flex items-center justify-center text-center text-zinc-400 text-xs border border-dashed border-border-subtle rounded-xl">
                Нет задач в очереди
              </div>
            )}

            {/* Quick Add Button */}
            <button
              onClick={() => {
                playTick();
                onOpenCreateModal();
              }}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-border-subtle hover:border-zinc-400 hover:bg-surface-100/50 text-zinc-400 hover:text-white text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Новая задача</span>
            </button>
          </div>
        </div>

        {/* ================= COLUMN 2: PROCESSING ================= */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-orange-500/15 text-orange-400 text-xs font-semibold border border-orange-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span>В работе</span>
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {filteredTasks.filter(t => t.taskStatus === 'PROCESSING').length}
              </span>
            </div>
          </div>

          <div className="space-y-3 min-h-[350px]">
            {filteredTasks
              .filter(t => t.taskStatus === 'PROCESSING')
              .map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    playTick();
                    onEditTask(t);
                  }}
                  className="p-3.5 rounded-xl bg-surface-100 border border-orange-500/30 hover:border-orange-500 hover:-translate-y-0.5 transition cursor-pointer shadow-sm space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-white leading-snug group-hover:text-accent-orange transition">
                      {t.title}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          playTick();
                          onEditTask(t);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-surface-200 transition"
                        title="Редактировать"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить задачу «${t.title}»?`)) onDeleteTask(t.id);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-accent-red hover:bg-surface-200 transition"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {t.description && (
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}

                  {/* Notion Property Rows */}
                  <div className="space-y-1.5 text-[11px] pt-2 border-t border-border-subtle">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Приоритет</span>
                      {getPriorityBadge(t.taskPriority)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Категория</span>
                      {getTypeBadge(t.taskType)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Ответственный</span>
                      <span className="inline-flex items-center gap-1.5 text-zinc-200 font-medium">
                        <img src={getTaskAvatar(t)} alt="Владик" className="w-4 h-4 rounded-full object-cover border border-zinc-700" />
                        <span className="text-[10.5px]">{getPersonaName(t)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Deadline + Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[10px] font-mono text-zinc-400">
                    <span className="text-accent-orange font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{t.deadline || 'Без срока'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTick();
                        onUpdateStatus(t.id, 'DONE');
                      }}
                      className="text-accent-green hover:underline font-semibold flex items-center gap-1 hover:text-emerald-400 transition"
                    >
                      <span>Готово ✓</span>
                      <CheckCircle2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

            {filteredTasks.filter(t => t.taskStatus === 'PROCESSING').length === 0 && (
              <div className="h-32 flex items-center justify-center text-center text-zinc-400 text-xs border border-dashed border-border-subtle rounded-xl">
                Нет задач в работе
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: DONE ================= */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Завершено</span>
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {filteredTasks.filter(t => t.taskStatus === 'DONE').length}
              </span>
            </div>
          </div>

          <div className="space-y-3 min-h-[350px]">
            {filteredTasks
              .filter(t => t.taskStatus === 'DONE')
              .map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    playTick();
                    onEditTask(t);
                  }}
                  className="p-3.5 rounded-xl bg-surface-100 border border-border-subtle opacity-75 hover:opacity-100 transition cursor-pointer shadow-sm space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-medium text-zinc-400 line-through leading-snug">
                      {t.title}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          playTick();
                          onEditTask(t);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-surface-200 transition"
                        title="Редактировать"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить задачу «${t.title}»?`)) onDeleteTask(t.id);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-accent-red hover:bg-surface-200 transition"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Notion Property Rows */}
                  <div className="space-y-1.5 text-[11px] pt-2 border-t border-border-subtle">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Категория</span>
                      {getTypeBadge(t.taskType)}
                    </div>
                  </div>

                  {/* Card Footer: Done tag + Return action */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[10px] font-mono text-zinc-400">
                    <span className="text-accent-green font-semibold">✓ Выполнено</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTick();
                        onUpdateStatus(t.id, 'TODO');
                      }}
                      className="text-zinc-400 hover:text-white transition"
                    >
                      Вернуть ↺
                    </button>
                  </div>
                </div>
              ))}

            {filteredTasks.filter(t => t.taskStatus === 'DONE').length === 0 && (
              <div className="h-32 flex items-center justify-center text-center text-zinc-400 text-xs border border-dashed border-border-subtle rounded-xl">
                Нет закрытых задач
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
