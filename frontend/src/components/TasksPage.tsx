import React from 'react';
import { 
  Flame, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Task, TaskType } from '../types';
import { playTick } from './AudioSynthesizer';

interface TasksPageProps {
  tasks: Task[];
  viewMode: 'kanban' | 'list';
  filter: string;
  searchQuery: string;
  onUpdateStatus: (id: string, newStatus: Task['taskStatus']) => void;
  onDeleteTask: (id: string) => void;
  onOpenCreateModal: () => void;
  isLoading?: boolean;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  viewMode,
  filter,
  searchQuery,
  onUpdateStatus,
  onDeleteTask,
  onOpenCreateModal,
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
    if (t.taskType === 'UNIVERSITY') return '/assets/vlad_2.jpg'; // Швабра
    if (t.taskType === 'LAUNCH') return '/assets/vlad_1.jpg'; // Кабан
    if (t.taskPriority === 'HIGH') return '/assets/vlad_6.jpg'; // Клаксон
    return '/assets/vlad_4.jpg'; // Сэр похмелье
  };

  const getTypeBadge = (type: TaskType) => {
    switch (type) {
      case 'UNIVERSITY':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/40 text-accent-blue border border-blue-900/50">🎓 Универ</span>;
      case 'LAUNCH':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-950/40 text-accent-green border border-green-900/50">💼 Запуск</span>;
      case 'SELF':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/40 text-accent-orange border border-orange-900/50">🐗 Владик</span>;
    }
  };

  const getPriorityBadge = (priority: Task['taskPriority']) => {
    switch (priority) {
      case 'HIGH':
        return <span className="text-[9px] font-mono text-accent-red flex items-center gap-1 font-bold">● HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[9px] font-mono text-accent-yellow flex items-center gap-1">● MED</span>;
      case 'LOW':
        return <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">○ LOW</span>;
    }
  };

  const getNextStatus = (current: Task['taskStatus']): Task['taskStatus'] => {
    if (current === 'TODO') return 'PROCESSING';
    if (current === 'PROCESSING') return 'DONE';
    return 'TODO';
  };

  // Urgent top task
  const urgentTask = tasks.find(t => t.taskPriority === 'HIGH' && t.taskType === 'UNIVERSITY' && t.taskStatus !== 'DONE');

  if (!isLoading && tasks.length === 0) {
    return (
      <div className="panel p-12 rounded-2xl text-center space-y-4 border border-dashed border-zinc-800">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-2xl shadow">
          🐗
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">В базе данных PostgreSQL пока нет задач</h3>
          <p className="text-xs text-zinc-500 font-mono max-w-md mx-auto">
            Таблица tasks в tasks_db (:5432) пуста. Создай первую задачу, и она мгновенно сохранится в базу данных.
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition shadow"
        >
          + Создать первую задачу в БД
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Urgent Alert Banner (Лаба по БД до 23:59) */}
      {urgentTask && (
        <div className="p-4 rounded-xl panel border-l-4 border-l-accent-red flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-950/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-900/30 text-accent-red mt-0.5">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-accent-red uppercase tracking-wider font-mono">
                  🔥 Горит дедлайн: сегодня до 23:59
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Лаба №3 по Базам Данных</span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-snug">
                {urgentTask.title} — если не сдать сегодня, научрук активирует режим отчисления.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onUpdateStatus(urgentTask.id, 'PROCESSING')}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <span>В работу</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Column: TODO */}
          <div className="panel p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1b22]">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                <span>В очереди (TODO)</span>
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {filteredTasks.filter(t => t.taskStatus === 'TODO').length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[350px]">
              {filteredTasks
                .filter(t => t.taskStatus === 'TODO')
                .map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      playTick();
                      onUpdateStatus(t.id, 'PROCESSING');
                    }}
                    className="p-3.5 rounded-lg panel-inset hover:border-zinc-700 transition cursor-pointer space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between">
                      {getTypeBadge(t.taskType)}
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(t.taskPriority)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(t.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-accent-red transition"
                          title="Удалить задачу"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <img
                        src={getTaskAvatar(t)}
                        alt="Владик"
                        className="w-7 h-7 rounded-md object-cover border border-zinc-700 shrink-0 mt-0.5 shadow"
                        title="Ответственный кент"
                      />
                      <div className="text-xs font-semibold text-white leading-snug group-hover:text-accent-orange transition">
                        {t.title}
                      </div>
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed pl-9">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        <span>До {t.deadline || 'дедлайна'}</span>
                      </span>
                      <span className="text-zinc-400 group-hover:text-white transition flex items-center gap-0.5">
                        <span>В работу</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}

              {filteredTasks.filter(t => t.taskStatus === 'TODO').length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-center text-zinc-600 text-xs font-mono space-y-2 border border-dashed border-zinc-800 rounded-lg">
                  <span>Очередь пуста</span>
                  <button
                    onClick={onOpenCreateModal}
                    className="text-accent-orange hover:underline text-[11px]"
                  >
                    + Добавить задачу
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Column: PROCESSING */}
          <div className="panel p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1b22]">
              <span className="text-xs font-bold text-accent-orange flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                <span>В работе (PROCESSING)</span>
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {filteredTasks.filter(t => t.taskStatus === 'PROCESSING').length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[350px]">
              {filteredTasks
                .filter(t => t.taskStatus === 'PROCESSING')
                .map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      playTick();
                      onUpdateStatus(t.id, 'DONE');
                    }}
                    className="p-3.5 rounded-lg panel-inset border-l-2 border-l-accent-orange hover:border-zinc-700 transition cursor-pointer space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between">
                      {getTypeBadge(t.taskType)}
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(t.taskPriority)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(t.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-accent-red transition"
                          title="Удалить задачу"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <img
                        src={getTaskAvatar(t)}
                        alt="Владик"
                        className="w-7 h-7 rounded-md object-cover border border-zinc-700 shrink-0 mt-0.5 shadow"
                        title="Ответственный кент"
                      />
                      <div className="text-xs font-semibold text-white leading-snug">
                        {t.title}
                      </div>
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed pl-9">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-accent-orange" />
                        <span className="text-zinc-300">До {t.deadline || 'дедлайна'}</span>
                      </span>
                      <span className="text-accent-green group-hover:underline flex items-center gap-0.5">
                        <span>Готово ✓</span>
                      </span>
                    </div>
                  </div>
                ))}

              {filteredTasks.filter(t => t.taskStatus === 'PROCESSING').length === 0 && (
                <div className="h-40 flex items-center justify-center text-center text-zinc-600 text-xs font-mono border border-dashed border-zinc-800 rounded-lg">
                  Кабан отдыхает, задач в работе нет
                </div>
              )}
            </div>
          </div>

          {/* Column: DONE */}
          <div className="panel p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1b22]">
              <span className="text-xs font-bold text-accent-green flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                <span>Завершено (DONE)</span>
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {filteredTasks.filter(t => t.taskStatus === 'DONE').length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[350px]">
              {filteredTasks
                .filter(t => t.taskStatus === 'DONE')
                .map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      playTick();
                      onUpdateStatus(t.id, 'TODO');
                    }}
                    className="p-3.5 rounded-lg panel-inset opacity-75 hover:opacity-100 transition cursor-pointer space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between">
                      {getTypeBadge(t.taskType)}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-accent-green">✓ ЗАКРЫТО</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(t.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-accent-red transition"
                          title="Удалить"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <img
                        src={getTaskAvatar(t)}
                        alt="Владик"
                        className="w-7 h-7 rounded-md object-cover border border-zinc-700 shrink-0 mt-0.5 grayscale"
                      />
                      <div className="text-xs font-medium text-zinc-400 line-through leading-snug">
                        {t.title}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 pt-1 border-t border-zinc-900">
                      <span>Накрыта поляна 🍺</span>
                      <span className="text-zinc-500 hover:text-white">Вернуть ↺</span>
                    </div>
                  </div>
                ))}

              {filteredTasks.filter(t => t.taskStatus === 'DONE').length === 0 && (
                <div className="h-40 flex items-center justify-center text-center text-zinc-600 text-xs font-mono border border-dashed border-zinc-800 rounded-lg">
                  Пока нет закрытых задач
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Linear List Table View */
        <div className="panel rounded-xl overflow-hidden divide-y divide-[#1b1b22]">
          <div className="grid grid-cols-12 px-4 py-2.5 text-[11px] font-mono text-zinc-500 uppercase bg-[#08080a]">
            <span className="col-span-1">Статус</span>
            <span className="col-span-6">Название задачи</span>
            <span className="col-span-2">Категория</span>
            <span className="col-span-1">Приоритет</span>
            <span className="col-span-2 text-right">Дедлайн & Кент</span>
          </div>

          {filteredTasks.map(t => (
            <div
              key={t.id}
              onClick={() => {
                playTick();
                onUpdateStatus(t.id, getNextStatus(t.taskStatus));
              }}
              className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-zinc-900/40 cursor-pointer transition group"
            >
              {/* Status */}
              <div className="col-span-1">
                {t.taskStatus === 'DONE' ? (
                  <CheckCircle2 className="w-4 h-4 text-accent-green" />
                ) : t.taskStatus === 'PROCESSING' ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-accent-orange border-t-transparent animate-spin inline-block" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-zinc-600 inline-block" />
                )}
              </div>

              {/* Title & Desc */}
              <div className="col-span-6 pr-4">
                <span className={`font-semibold ${t.taskStatus === 'DONE' ? 'line-through text-zinc-500' : 'text-white'}`}>
                  {t.title}
                </span>
                {t.description && (
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {t.description}
                  </p>
                )}
              </div>

              {/* Type */}
              <div className="col-span-2">
                {getTypeBadge(t.taskType)}
              </div>

              {/* Priority */}
              <div className="col-span-1">
                {getPriorityBadge(t.taskPriority)}
              </div>

              {/* Deadline & Assignee */}
              <div className="col-span-2 flex items-center justify-end gap-2.5 font-mono text-[11px] text-zinc-400">
                <span>{t.deadline || '—'}</span>
                <img
                  src={getTaskAvatar(t)}
                  alt="Владик"
                  className="w-6 h-6 rounded-md object-cover border border-zinc-700 shadow"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(t.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-accent-red transition ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-xs font-mono">
              Ни одной задачи не найдено
            </div>
          )}
        </div>
      )}

    </div>
  );
};
