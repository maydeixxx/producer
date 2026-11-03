import React, { useState, useEffect } from 'react';
import { Search, Trash2, Edit3, ExternalLink, ArrowRight } from 'lucide-react';
import { ExpertData } from '../types';
import { playTick, triggerDronePing } from './AudioSynthesizer';
import { EditExpertModal } from './EditExpertModal';

interface InstaScoutPageProps {
  onTaskCreatedFromScout: (title: string, desc: string) => void;
  onShowReaction: (img: string, title: string, quote: string) => void;
}

const SCAN_API = "http://localhost:8083/api/v1/expert";

export const InstaScoutPage: React.FC<InstaScoutPageProps> = ({ onTaskCreatedFromScout, onShowReaction }) => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Views: 'report' or 'all-experts'
  const [subView, setSubView] = useState<'report' | 'all-experts'>('report');
  
  const [expertsList, setExpertsList] = useState<ExpertData[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<ExpertData | null>(null);
  
  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<ExpertData | null>(null);

  // Fetch all experts from ScanService (:8083)
  const fetchExperts = async () => {
    try {
      const res = await fetch(`${SCAN_API}/all`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setExpertsList(list);
          if (list.length > 0 && !selectedExpert) {
            setSelectedExpert(list[list.length - 1]);
          }
        }
      }
    } catch {
      // Backend offline
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    playTick();
    triggerDronePing();
    setLoading(true);

    try {
      const res = await fetch(`${SCAN_API}?link=${encodeURIComponent(url.trim())}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSelectedExpert(data);
        onShowReaction('/assets/vlad_3.jpg', `АНАЛИЗ ЗАВЕРШЕН: @${data.nickname}`, '«Охваты и боли целевой аудитории собраны!»');
        await fetchExperts();
        setSubView('report');
        setUrl('');
      } else {
        alert('Не удалось проанализировать профиль. Проверьте ссылку на профиль.');
      }
    } catch {
      alert('Сервис анализа временно недоступен. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStrategy = async (id: string, strategy: string, payload: Record<string, unknown>) => {
    try {
      const body = { id, strategy, ...payload };
      const res = await fetch(`${SCAN_API}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        await fetchExperts();
        // Update selected if needed
        if (selectedExpert && selectedExpert.id === id) {
          const updated = await fetch(`${SCAN_API}/nickname?nickname=${selectedExpert.nickname}`);
          if (updated.ok) setSelectedExpert(await updated.json());
        }
      }
    } catch {
      //
    }
  };

  const handleDeleteExpert = async (nickname: string) => {
    try {
      const res = await fetch(`${SCAN_API}/delete?nickname=${encodeURIComponent(nickname)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchExperts();
        if (selectedExpert && selectedExpert.nickname === nickname) {
          setSelectedExpert(null);
        }
        onShowReaction('/assets/vlad_8.jpg', 'ЭКСПЕРТ УДАЛЕН', `«Профиль @${nickname} удален из аналитики»`);
      }
    } catch {
      //
    }
  };

  const handleCreateProject = () => {
    if (!selectedExpert) return;
    playTick();
    onTaskCreatedFromScout(
      `Запуск эксперта @${selectedExpert.nickname}`,
      `Охваты: ${selectedExpert.coverage ? selectedExpert.coverage.toLocaleString() : '—'}. Разработать сценарии прогрева по болям аудитории.`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>InstaScout AI</span>
            <span className="badge bg-blue-950/40 text-accent-blue border border-blue-900/50 text-[10px]">
              Аналитика Instagram
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Анализ вовлеченности, охватов рилсов и выявление болей аудитории
          </p>
        </div>

        {/* View Switcher: Report vs All Experts */}
        <div className="flex items-center bg-surface-100 p-1 rounded-xl border border-border-subtle text-xs">
          <button
            onClick={() => { playTick(); setSubView('report'); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              subView === 'report' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Текущий отчет
          </button>
          <button
            onClick={() => { playTick(); setSubView('all-experts'); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              subView === 'all-experts' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Все эксперты</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-200 text-zinc-300">
              {expertsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Input panel (Clean, no weird presets or jargon) */}
      <div className="panel p-5 rounded-2xl space-y-3">
        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Введите ссылку на профиль Instagram (например: https://www.instagram.com/username/)..."
            className="flex-1 bg-surface-200 border border-border-subtle focus:border-zinc-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition flex items-center justify-center gap-2 shadow shrink-0 active:scale-95"
          >
            {loading ? <span className="animate-spin">🌀</span> : <Search className="w-3.5 h-3.5" />}
            <span>{loading ? 'Анализирую...' : 'Анализировать'}</span>
          </button>
        </form>
      </div>

      {/* SUBVIEW 1: All Experts Catalog */}
      {subView === 'all-experts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-medium">
            <span>Сохраненные профили экспертов ({expertsList.length})</span>
            <span>Кликните, чтобы открыть полный отчет или редактировать</span>
          </div>

          {expertsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expertsList.map((exp) => (
                <div
                  key={exp.id || exp.nickname}
                  className="panel p-4 rounded-xl space-y-3 hover:border-zinc-500 transition cursor-pointer group"
                  onClick={() => {
                    playTick();
                    setSelectedExpert(exp);
                    setSubView('report');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-surface-200 border border-border-subtle flex items-center justify-center text-sm font-bold text-accent-orange">
                        @{exp.nickname.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-accent-orange transition">
                          @{exp.nickname}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Охваты: {exp.coverage ? exp.coverage.toLocaleString() : '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTick();
                          setEditingExpert(exp);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-md hover:bg-surface-200 text-zinc-400 hover:text-white transition"
                        title="Редактировать"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Удалить эксперта @${exp.nickname}?`)) {
                            handleDeleteExpert(exp.nickname);
                          }
                        }}
                        className="p-1.5 rounded-md hover:bg-surface-200 text-zinc-500 hover:text-accent-red transition"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {exp.targetAud && (
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {exp.targetAud}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-border-subtle">
                    <span>Болей: {exp.needs ? exp.needs.length : 0} • Рычагов: {exp.levers ? exp.levers.length : 0}</span>
                    <span className="text-accent-orange flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      <span>Открыть</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel p-12 rounded-2xl text-center space-y-3 border border-dashed border-border-subtle">
              <h3 className="text-sm font-semibold text-white">Список экспертов пуст</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Введите ссылку на Instagram профиль выше, чтобы провести первый анализ.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUBVIEW 2: Report View */}
      {subView === 'report' && (
        selectedExpert ? (
          <div className="panel p-6 rounded-2xl space-y-6">
            
            {/* Header with stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-center text-lg font-bold text-accent-orange">
                  @{selectedExpert.nickname.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">@{selectedExpert.nickname}</span>
                    {selectedExpert.expertLink && (
                      <a 
                        href={selectedExpert.expertLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-white transition"
                        title="Открыть в Instagram"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">Проанализированный профиль эксперта</p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center gap-2">
                <div className="panel-inset px-4 py-2 rounded-xl text-center">
                  <div className="text-[10px] text-zinc-400 font-mono uppercase">Охваты Reels</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {selectedExpert.coverage ? selectedExpert.coverage.toLocaleString() : '—'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    playTick();
                    setEditingExpert(selectedExpert);
                    setIsEditModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-surface-200 hover:bg-surface-300 text-zinc-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-border-subtle"
                  title="Редактировать параметры эксперта"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Редактировать</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Удалить эксперта @${selectedExpert.nickname}?`)) {
                      handleDeleteExpert(selectedExpert.nickname);
                    }
                  }}
                  className="p-2 rounded-xl bg-surface-200 hover:bg-red-950/40 hover:text-accent-red text-zinc-400 text-xs transition border border-border-subtle"
                  title="Удалить профиль"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Target Audience */}
            <div className="panel-inset p-4 rounded-xl space-y-1.5">
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Портрет целевой аудитории
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {selectedExpert.targetAud || 'Информация о целевой аудитории не заполнена.'}
              </p>
            </div>

            {/* Needs vs Levers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pains */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-white flex items-center justify-between pb-1.5 border-b border-border-subtle">
                  <span>Боли аудитории</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {selectedExpert.needs ? selectedExpert.needs.length : 0} пунктов
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedExpert.needs && selectedExpert.needs.length > 0 ? (
                    selectedExpert.needs.map((n, i) => (
                      <div key={i} className="p-3 rounded-xl panel-inset text-xs leading-relaxed text-zinc-300 italic">
                        {n}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500 italic p-2">Боли не указаны</div>
                  )}
                </div>
              </div>

              {/* Levers */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-white flex items-center justify-between pb-1.5 border-b border-border-subtle">
                  <span>Контентные рычаги влияния</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {selectedExpert.levers ? selectedExpert.levers.length : 0} пунктов
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedExpert.levers && selectedExpert.levers.length > 0 ? (
                    selectedExpert.levers.map((l, i) => (
                      <div key={i} className="p-3 rounded-xl panel-inset text-xs leading-relaxed space-y-1">
                        <span className="text-[10px] font-mono uppercase text-accent-green block font-semibold">
                          Рычаг:
                        </span>
                        <span className="text-zinc-300">{l}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500 italic p-2">Рычаги не указаны</div>
                  )}
                </div>
              </div>

            </div>

            {/* Action */}
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <button
                onClick={handleCreateProject}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition shadow flex items-center gap-1.5 active:scale-95"
              >
                <span>+ Создать проект запуска для @{selectedExpert.nickname}</span>
              </button>

              <span className="text-xs text-zinc-500 font-mono">
                Аналитика сохранена
              </span>
            </div>

          </div>
        ) : (
          <div className="panel p-12 rounded-2xl text-center space-y-3 border border-dashed border-border-subtle">
            <h3 className="text-sm font-semibold text-white">Нет активного отчета</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Введите ссылку на Instagram профиль выше для запуска анализа или выберите эксперта из вкладки «Все эксперты».
            </p>
          </div>
        )
      )}

      {/* Edit Expert Modal */}
      <EditExpertModal
        expert={editingExpert}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpert(null);
        }}
        onUpdateStrategy={handleUpdateStrategy}
        onDeleteExpert={handleDeleteExpert}
        onRefresh={fetchExperts}
      />

    </div>
  );
};
