import React, { useState, useEffect } from 'react';
import { X, Trash2, Check } from 'lucide-react';
import { Task, TaskType, TaskPriority, TaskStatus } from '../types';
import { playTick } from './AudioSynthesizer';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('UNIVERSITY');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('TODO');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setTaskType(task.taskType || 'UNIVERSITY');
      setTaskPriority(task.taskPriority || 'MEDIUM');
      setTaskStatus(task.taskStatus || 'TODO');
      setDeadline(task.deadline || new Date().toISOString().split('T')[0]);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    playTick();

    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      taskType,
      taskPriority,
      taskStatus,
      deadline,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="panel p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl border border-border-subtle bg-surface-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Редактирование задачи</span>
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-surface-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Название задачи</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Дополнительные заметки и детали..."
              className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Статус</label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none font-medium"
              >
                <option value="TODO">В очереди (TODO)</option>
                <option value="PROCESSING">В работе (PROCESSING)</option>
                <option value="DONE">Завершено (DONE)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Категория</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none font-medium"
              >
                <option value="UNIVERSITY">🎓 Универ</option>
                <option value="LAUNCH">💼 Запуск</option>
                <option value="SELF">🐗 Личное</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Приоритет</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none font-medium"
              >
                <option value="HIGH">🔥 Высокий</option>
                <option value="MEDIUM">⚡ Средний</option>
                <option value="LOW">💤 Низкий</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Дедлайн</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3.5 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirm('Удалить эту задачу?')) {
                  onDelete(task.id);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-accent-red border border-red-900/40 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-zinc-300 text-xs font-medium transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
