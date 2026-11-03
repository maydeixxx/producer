import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TaskType, TaskPriority } from '../types';
import { playTick } from './AudioSynthesizer';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    taskType: TaskType;
    taskPriority: TaskPriority;
    deadline: string;
  }) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('UNIVERSITY');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    playTick();
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      taskType,
      taskPriority,
      deadline
    });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="panel p-5 rounded-2xl max-w-md w-full space-y-4 shadow-2xl border border-zinc-700 bg-[#0c0c10]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1b1b22]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Новая задача в ProducerOS</span>
            <span className="badge bg-zinc-800 text-zinc-400 font-mono text-[9px]">:8081</span>
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Название задачи</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="например: Сдать лабу №3 по базам данных..."
              className="w-full bg-surface-100 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Описание (опционально)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробности, требования научрука или воронка эксперта..."
              rows={2}
              className="w-full bg-surface-100 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Категория</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full bg-surface-100 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
              >
                <option value="UNIVERSITY">🎓 Универ (UNIVERSITY)</option>
                <option value="LAUNCH">💼 Запуск (LAUNCH)</option>
                <option value="SELF">🐗 Владик / Личное (SELF)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Приоритет</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full bg-surface-100 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
              >
                <option value="HIGH">🔥 Высокий (HIGH)</option>
                <option value="MEDIUM">⚡ Средний (MEDIUM)</option>
                <option value="LOW">💤 Низкий (LOW)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Дедлайн</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-surface-100 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition shadow"
            >
              Создать задачу
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-zinc-400 hover:text-white text-xs transition"
            >
              Отмена
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
