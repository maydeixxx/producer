import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { ExpertData } from '../types';
import { playTick } from './AudioSynthesizer';

interface EditExpertModalProps {
  expert: ExpertData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStrategy: (id: string, strategy: string, payload: Record<string, unknown>) => Promise<void>;
  onDeleteExpert: (nickname: string) => Promise<void>;
  onRefresh: () => void;
}

export const EditExpertModal: React.FC<EditExpertModalProps> = ({
  expert,
  isOpen,
  onClose,
  onUpdateStrategy,
  onDeleteExpert,
  onRefresh
}) => {
  const [targetAud, setTargetAud] = useState('');
  const [coverage, setCoverage] = useState<number>(0);
  const [newNeedText, setNewNeedText] = useState('');
  const [newLeverText, setNewLeverText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (expert) {
      setTargetAud(expert.targetAud || '');
      setCoverage(expert.coverage || 0);
    }
  }, [expert]);

  if (!isOpen || !expert) return null;

  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expert.id) return;
    setIsSaving(true);
    playTick();

    try {
      if (targetAud !== expert.targetAud) {
        await onUpdateStrategy(expert.id, 'targetaud', { newTargetAudText: targetAud });
      }
      if (coverage !== expert.coverage) {
        await onUpdateStrategy(expert.id, 'coverage', { newCoverage: Number(coverage) });
      }
      onRefresh();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNeed = async () => {
    if (!newNeedText.trim() || !expert.id) return;
    playTick();
    await onUpdateStrategy(expert.id, 'addneed', { need: newNeedText.trim() });
    setNewNeedText('');
    onRefresh();
  };

  const handleRemoveNeed = async (need: string) => {
    if (!expert.id) return;
    playTick();
    await onUpdateStrategy(expert.id, 'removeneed', { need });
    onRefresh();
  };

  const handleAddLever = async () => {
    if (!newLeverText.trim() || !expert.id) return;
    playTick();
    await onUpdateStrategy(expert.id, 'addlever', { lever: newLeverText.trim() });
    setNewLeverText('');
    onRefresh();
  };

  const handleRemoveLever = async (lever: string) => {
    if (!expert.id) return;
    playTick();
    await onUpdateStrategy(expert.id, 'removelever', { lever });
    onRefresh();
  };

  const handleDelete = async () => {
    if (confirm(`Удалить эксперта @${expert.nickname}?`)) {
      playTick();
      await onDeleteExpert(expert.nickname);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="panel p-6 rounded-2xl max-w-xl w-full space-y-5 shadow-2xl border border-border-subtle bg-surface-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Редактирование эксперта</span>
              <span className="text-accent-orange font-mono">@{expert.nickname}</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Обновление параметров аналитики и сегментов ЦА</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-surface-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Basic settings form */}
        <form onSubmit={handleSaveBasic} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Охваты Reels</label>
            <input
              type="number"
              value={coverage}
              onChange={(e) => setCoverage(Number(e.target.value))}
              className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Портрет целевой аудитории</label>
            <textarea
              value={targetAud}
              onChange={(e) => setTargetAud(e.target.value)}
              rows={3}
              className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить основные данные'}</span>
            </button>
          </div>
        </form>

        {/* Dynamic Needs management */}
        <div className="space-y-3 pt-3 border-t border-border-subtle">
          <label className="text-xs font-bold text-white block">Боли аудитории (Needs)</label>
          
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {expert.needs && expert.needs.map((need, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-surface-200 text-xs text-zinc-300">
                <span className="flex-1 leading-snug">{need}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveNeed(need)}
                  className="text-zinc-500 hover:text-accent-red p-0.5 transition shrink-0"
                  title="Удалить боль"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNeedText}
              onChange={(e) => setNewNeedText(e.target.value)}
              placeholder="Добавить новую боль ЦА..."
              className="flex-1 bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddNeed}
              className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-white text-xs font-medium transition flex items-center gap-1 border border-border-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        {/* Dynamic Levers management */}
        <div className="space-y-3 pt-3 border-t border-border-subtle">
          <label className="text-xs font-bold text-white block">Контентные рычаги (Levers)</label>
          
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {expert.levers && expert.levers.map((lever, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-surface-200 text-xs text-zinc-300">
                <span className="flex-1 leading-snug">{lever}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLever(lever)}
                  className="text-zinc-500 hover:text-accent-red p-0.5 transition shrink-0"
                  title="Удалить рычаг"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newLeverText}
              onChange={(e) => setNewLeverText(e.target.value)}
              placeholder="Добавить контентный рычаг..."
              className="flex-1 bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddLever}
              className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-white text-xs font-medium transition flex items-center gap-1 border border-border-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        {/* Delete Expert */}
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-accent-red border border-red-900/40 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Удалить эксперта из системы</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-zinc-300 text-xs font-medium transition"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
