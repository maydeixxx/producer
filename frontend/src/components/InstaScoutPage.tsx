import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Edit3, ExternalLink, ArrowRight, AtSign, Globe, AlertCircle } from 'lucide-react';
import { ExpertData } from '../types';
import { playTick, triggerDronePing } from './AudioSynthesizer';
import { EditExpertModal } from './EditExpertModal';

interface InstaScoutPageProps {
  onTaskCreatedFromScout: (title: string, desc: string) => void;
  onShowReaction: (img: string, title: string, quote: string) => void;
  externalSearchQuery?: string;
  onClearExternalSearch?: () => void;
  selectedExpert?: ExpertData | null;
  onSelectExpert?: (expert: ExpertData | null) => void;
}

const SCAN_API = "http://localhost:8083/api/v1/expert";

export const InstaScoutPage: React.FC<InstaScoutPageProps> = ({ 
  onTaskCreatedFromScout, 
  onShowReaction,
  externalSearchQuery = "",
  onClearExternalSearch,
  selectedExpert: parentSelectedExpert,
  onSelectExpert: parentOnSelectExpert
}) => {
  // Top action tab: search by nickname vs parse new profile by URL
  const [actionTab, setActionTab] = useState<'nickname' | 'url'>('nickname');
  
  // Nickname search state & dropdown
  const [nicknameInput, setNicknameInput] = useState<string>("");
  const [isSearchingNickname, setIsSearchingNickname] = useState<boolean>(false);
  const [nicknameNotFound, setNicknameNotFound] = useState<string | null>(null);
  const [isNicknameDropdownOpen, setIsNicknameDropdownOpen] = useState<boolean>(false);
  const nicknameContainerRef = useRef<HTMLDivElement>(null);

  // Parse URL state
  const [url, setUrl] = useState<string>("");
  const [loadingParse, setLoadingParse] = useState<boolean>(false);
  
  // Views: 'report' or 'all-experts'
  const [subView, setSubView] = useState<'report' | 'all-experts'>('report');
  
  // Catalog search/filter
  const [catalogFilter, setCatalogFilter] = useState<string>("");

  const [expertsList, setExpertsList] = useState<ExpertData[]>([]);
  const [internalSelectedExpert, setInternalSelectedExpert] = useState<ExpertData | null>(null);

  const selectedExpert = parentSelectedExpert !== undefined ? parentSelectedExpert : internalSelectedExpert;
  const setSelectedExpert = (exp: ExpertData | null) => {
    setInternalSelectedExpert(exp);
    if (parentOnSelectExpert) parentOnSelectExpert(exp);
  };
  
  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<ExpertData | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nicknameContainerRef.current && !nicknameContainerRef.current.contains(e.target as Node)) {
        setIsNicknameDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // When external search query is provided from the top header
  useEffect(() => {
    if (externalSearchQuery.trim()) {
      setNicknameInput(externalSearchQuery);
      setCatalogFilter(externalSearchQuery);
      handleSearchByNickname(externalSearchQuery, false);
    }
  }, [externalSearchQuery]);

  // When parent selects an expert
  useEffect(() => {
    if (parentSelectedExpert) {
      setSubView('report');
    }
  }, [parentSelectedExpert]);

  // Search expert by nickname via backend GET /api/v1/expert/nickname?nickname=...
  const handleSearchByNickname = async (queryNickname: string, triggerSound = true) => {
    const clean = queryNickname.trim().replace(/^@/, '');
    if (!clean) return;
    if (triggerSound) playTick();

    setIsSearchingNickname(true);
    setNicknameNotFound(null);
    setIsNicknameDropdownOpen(false);

    try {
      const res = await fetch(`${SCAN_API}/nickname?nickname=${encodeURIComponent(clean.toLowerCase())}`);
      if (res.ok) {
        const expert: ExpertData = await res.json();
        setSelectedExpert(expert);
        setSubView('report');
        setNicknameNotFound(null);
        onShowReaction(
          '/assets/vlad_3.jpg',
          `ЭКСПЕРТ НАЙДЕН: @${expert.nickname}`,
          `«Охваты: ${expert.coverage ? expert.coverage.toLocaleString() : '—'}, болей аудитории: ${expert.needs?.length || 0}»`
        );
      } else if (res.status === 404) {
        setNicknameNotFound(clean);
      } else {
        alert(`Ошибка при поиске эксперта: код ${res.status}`);
      }
    } catch {
      alert('Сервис ScanService (:8083) недоступен. Проверьте подключение.');
    } finally {
      setIsSearchingNickname(false);
    }
  };

  // Parse new expert via backend POST /api/v1/expert?link=...
  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    playTick();
    triggerDronePing();
    setLoadingParse(true);
    setNicknameNotFound(null);

    try {
      const res = await fetch(`${SCAN_API}?link=${encodeURIComponent(url.trim())}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSelectedExpert(data);
        onShowReaction('/assets/vlad_3.jpg', `АНАЛИЗ ЗАВЕРШЕН: @${data.nickname}`, '«Охваты и боли целевой аудитории собраны в базу!»');
        await fetchExperts();
        setSubView('report');
        setUrl('');
      } else {
        alert('Не удалось спарсить профиль. Проверьте валидность ссылки на Instagram.');
      }
    } catch {
      alert('Сервис анализа временно недоступен. Попробуйте позже.');
    } finally {
      setLoadingParse(false);
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

  // Filtered list for "Все эксперты" catalog
  const cleanFilter = catalogFilter.trim().toLowerCase().replace(/^@/, '');
  const filteredExperts = cleanFilter
    ? expertsList.filter(e => e.nickname.toLowerCase().includes(cleanFilter))
    : expertsList;

  // Matching experts for dropdown
  const cleanNickQuery = nicknameInput.trim().toLowerCase().replace(/^@/, '');
  const matchingLocalExperts = cleanNickQuery
    ? expertsList.filter(e => e.nickname.toLowerCase().includes(cleanNickQuery)).slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>InstaScout AI</span>
            <span className="badge bg-blue-950/40 text-accent-blue border border-blue-900/50 text-[10px]">
              Бэкенд :8083
            </span>
          </h2>
          <p className="text-xs text-zinc-300 mt-0.5">
            Поиск экспертов по никнейму, парсинг Instagram и глубокий анализ целевой аудитории
          </p>
        </div>

        {/* View Switcher: Report vs All Experts */}
        <div className="flex items-center bg-surface-100 p-1 rounded-xl border border-border-subtle text-xs">
          <button
            onClick={() => { playTick(); setSubView('report'); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              subView === 'report' ? 'bg-surface-300 text-white shadow-sm' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Текущий отчет
          </button>
          <button
            onClick={() => { playTick(); setSubView('all-experts'); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              subView === 'all-experts' ? 'bg-surface-300 text-white shadow-sm' : 'text-zinc-300 hover:text-white'
            }`}
          >
            <span>Все эксперты</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-200 text-zinc-200">
              {expertsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Action / Search Panel (Backend Search by Nickname & Parse by URL) */}
      <div className="panel p-5 rounded-2xl space-y-4">
        
        {/* Toggle between Nickname Search & URL Parse */}
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <button
            type="button"
            onClick={() => {
              playTick();
              setActionTab('nickname');
              setNicknameNotFound(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              actionTab === 'nickname'
                ? 'bg-surface-300 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-surface-200'
            }`}
          >
            <AtSign className="w-3.5 h-3.5 text-accent-blue" />
            <span>Поиск по никнейму</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTick();
              setActionTab('url');
              setNicknameNotFound(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              actionTab === 'url'
                ? 'bg-surface-300 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-surface-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-accent-orange" />
            <span>Парсинг по ссылке</span>
          </button>
        </div>

        {/* Option 1: Search by Nickname with Dropdown ("Слайдбар" выпадающий список) */}
        {actionTab === 'nickname' && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchByNickname(nicknameInput);
            }} 
            className="flex flex-col sm:flex-row gap-2.5 relative"
          >
            <div className="relative flex-1" ref={nicknameContainerRef}>
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">@</span>
              <input
                type="text"
                value={nicknameInput}
                onFocus={() => setIsNicknameDropdownOpen(true)}
                onChange={(e) => {
                  setNicknameInput(e.target.value);
                  setIsNicknameDropdownOpen(true);
                  setNicknameNotFound(null);
                }}
                placeholder="Введите никнейм эксперта (например: cakeofsof или @username)..."
                className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-300 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none transition"
                required
              />

              {/* Dropdown suggestions under nickname input */}
              {isNicknameDropdownOpen && nicknameInput.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-40 panel bg-surface-100 rounded-xl shadow-2xl border border-border-subtle p-2 max-h-72 overflow-y-auto space-y-1">
                  
                  {matchingLocalExperts.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase text-zinc-300 px-2 py-1 font-bold flex items-center justify-between">
                        <span>Сохраненные эксперты ({matchingLocalExperts.length})</span>
                        <span className="text-[9px] text-zinc-400 font-normal">клик — открыть досье</span>
                      </div>
                      {matchingLocalExperts.map((exp) => (
                        <div
                          key={exp.id || exp.nickname}
                          onClick={() => {
                            playTick();
                            setSelectedExpert(exp);
                            setSubView('report');
                            setEditingExpert(exp);
                            setIsEditModalOpen(true);
                            setIsNicknameDropdownOpen(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-200 cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded bg-surface-200 border border-border-subtle flex items-center justify-center text-xs font-bold text-accent-orange">
                              @{exp.nickname.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-accent-orange transition">
                                @{exp.nickname}
                              </div>
                              <div className="text-[10px] text-zinc-300 font-mono">
                                Охваты: {exp.coverage ? exp.coverage.toLocaleString() : '—'} • Болей: {exp.needs?.length || 0}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-accent-orange flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <span>Открыть меню</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    onClick={() => {
                      handleSearchByNickname(nicknameInput);
                      setIsNicknameDropdownOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-surface-200 cursor-pointer transition text-xs text-accent-blue font-semibold flex items-center gap-2 border-t border-border-subtle mt-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Искать на сервере «@{cleanNickQuery}» (:8083)</span>
                  </div>

                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearchingNickname}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-[#1f1818] text-xs font-bold transition flex items-center justify-center gap-2 shadow shrink-0 active:scale-95"
            >
              {isSearchingNickname ? <span className="animate-spin">🌀</span> : <Search className="w-3.5 h-3.5" />}
              <span>{isSearchingNickname ? 'Ищу в базе...' : 'Найти эксперта'}</span>
            </button>
          </form>
        )}

        {/* Option 2: Parse by Instagram URL */}
        {actionTab === 'url' && (
          <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Введите ссылку на профиль Instagram (например: https://www.instagram.com/cakeofsof/)..."
              className="flex-1 bg-surface-200 border border-border-subtle focus:border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none transition"
              required
            />
            <button
              type="submit"
              disabled={loadingParse}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-[#1f1818] text-xs font-bold transition flex items-center justify-center gap-2 shadow shrink-0 active:scale-95"
            >
              {loadingParse ? <span className="animate-spin">🌀</span> : <Search className="w-3.5 h-3.5" />}
              <span>{loadingParse ? 'Анализирую...' : 'Спарсить и проанализировать'}</span>
            </button>
          </form>
        )}

        {/* Nickname Not Found Alert */}
        {nicknameNotFound && (
          <div className="p-3.5 rounded-xl bg-orange-950/40 border border-orange-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-orange-200">
              <AlertCircle className="w-4 h-4 text-accent-orange shrink-0" />
              <span>
                Эксперт <strong>@{nicknameNotFound}</strong> не найден в базе данных ScanService.
              </span>
            </div>
            <button
              onClick={() => {
                setUrl(`https://www.instagram.com/${nicknameNotFound}/`);
                setActionTab('url');
                setNicknameNotFound(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-accent-orange hover:bg-orange-500 text-black font-bold text-xs transition shrink-0"
            >
              Спарсить @{nicknameNotFound}
            </button>
          </div>
        )}

      </div>

      {/* SUBVIEW 1: All Experts Catalog */}
      {subView === 'all-experts' && (
        <div className="space-y-4">
          
          {/* Catalog Top Controls: Search Bar & Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-zinc-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={catalogFilter}
                onChange={(e) => setCatalogFilter(e.target.value)}
                placeholder="Фильтр по нику эксперта (@)..."
                className="w-full bg-surface-200 border border-border-subtle focus:border-zinc-300 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <span>Показано: {filteredExperts.length} из {expertsList.length}</span>
              {catalogFilter.trim() && (
                <button
                  onClick={() => {
                    setCatalogFilter('');
                    setNicknameInput('');
                    if (onClearExternalSearch) onClearExternalSearch();
                  }}
                  className="px-2 py-1 rounded bg-surface-200 hover:bg-surface-300 text-zinc-300 hover:text-white transition text-[11px]"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>

          {filteredExperts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExperts.map((exp) => (
                <div
                  key={exp.id || exp.nickname}
                  className="panel p-4 rounded-xl space-y-3 hover:border-zinc-400 transition cursor-pointer group"
                  onClick={() => {
                    playTick();
                    setSelectedExpert(exp);
                    setSubView('report');
                    setEditingExpert(exp);
                    setIsEditModalOpen(true);
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
                        <div className="text-[10px] text-zinc-300 font-mono">
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
                        className="p-1.5 rounded-md hover:bg-surface-200 text-zinc-300 hover:text-white transition"
                        title="Редактировать стратегию эксперта"
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
                        className="p-1.5 rounded-md hover:bg-surface-200 text-zinc-400 hover:text-accent-red transition"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {exp.targetAud && (
                    <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                      {exp.targetAud}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300 pt-2 border-t border-border-subtle">
                    <span>Болей: {exp.needs ? exp.needs.length : 0} • Рычагов: {exp.levers ? exp.levers.length : 0}</span>
                    <span className="text-accent-orange flex items-center gap-1 group-hover:translate-x-0.5 transition font-semibold">
                      <span>Открыть меню</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel p-10 rounded-2xl text-center space-y-3 border border-dashed border-border-subtle">
              <h3 className="text-sm font-semibold text-white">
                {cleanFilter ? `Эксперт @${cleanFilter} не найден среди сохраненных` : 'В базе пока нет экспертов'}
              </h3>
              <p className="text-xs text-zinc-300 max-w-md mx-auto">
                {cleanFilter
                  ? 'Вы можете выполнить прямой запрос к бэкенду или спарсить новый профиль.'
                  : 'Введите никнейм для поиска или ссылку на Instagram выше.'}
              </p>
              {cleanFilter && (
                <button
                  onClick={() => handleSearchByNickname(cleanFilter)}
                  className="px-4 py-2 rounded-xl bg-surface-200 hover:bg-surface-300 border border-border-subtle text-white text-xs font-semibold transition"
                >
                  Искать «@{cleanFilter}» на бэкенде (:8083)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBVIEW 2: Report View for Selected Expert */}
      {subView === 'report' && (
        selectedExpert ? (
          <div className="panel p-6 rounded-2xl space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-center text-lg font-bold text-accent-orange">
                  @{selectedExpert.nickname.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">@{selectedExpert.nickname}</h3>
                    {selectedExpert.expertLink && (
                      <a
                        href={selectedExpert.expertLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-300 hover:text-white transition"
                        title="Открыть в Instagram"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-zinc-300 font-mono flex items-center gap-3 mt-0.5">
                    <span>Охваты: <strong className="text-white">{selectedExpert.coverage ? selectedExpert.coverage.toLocaleString() : '—'}</strong></span>
                    <span>•</span>
                    <span>Болей: <strong className="text-accent-orange">{selectedExpert.needs ? selectedExpert.needs.length : 0}</strong></span>
                    <span>•</span>
                    <span>Рычагов: <strong className="text-accent-green">{selectedExpert.levers ? selectedExpert.levers.length : 0}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playTick();
                    setEditingExpert(selectedExpert);
                    setIsEditModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-surface-200 hover:bg-surface-300 text-zinc-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-border-subtle"
                  title="Редактировать стратегию и боли эксперта"
                >
                  <Edit3 className="w-3.5 h-3.5 text-accent-orange" />
                  <span>Редактировать меню</span>
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
              <div className="text-[11px] font-mono text-zinc-300 uppercase tracking-wider font-semibold">
                Портрет целевой аудитории
              </div>
              <p className="text-xs text-zinc-100 leading-relaxed">
                {selectedExpert.targetAud || 'Информация о целевой аудитории не заполнена.'}
              </p>
            </div>

            {/* Needs vs Levers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pains */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-white flex items-center justify-between pb-1.5 border-b border-border-subtle">
                  <span>Боли аудитории</span>
                  <span className="text-[10px] font-mono text-zinc-300 font-bold">
                    {selectedExpert.needs ? selectedExpert.needs.length : 0} пунктов
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedExpert.needs && selectedExpert.needs.length > 0 ? (
                    selectedExpert.needs.map((n, i) => (
                      <div key={i} className="p-3 rounded-xl panel-inset text-xs leading-relaxed text-zinc-200 italic">
                        {n}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-400 italic p-2">Боли не указаны</div>
                  )}
                </div>
              </div>

              {/* Levers */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-white flex items-center justify-between pb-1.5 border-b border-border-subtle">
                  <span>Контентные рычаги влияния</span>
                  <span className="text-[10px] font-mono text-zinc-300 font-bold">
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
                        <span className="text-zinc-200">{l}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-400 italic p-2">Рычаги не указаны</div>
                  )}
                </div>
              </div>

            </div>

            {/* Action */}
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <button
                onClick={handleCreateProject}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-[#1f1818] text-xs font-bold transition shadow flex items-center gap-1.5 active:scale-95"
              >
                <span>+ Создать проект запуска для @{selectedExpert.nickname}</span>
              </button>

              <span className="text-xs text-zinc-300 font-mono">
                Аналитика сохранена в базе
              </span>
            </div>

          </div>
        ) : (
          <div className="panel p-12 rounded-2xl text-center space-y-3 border border-dashed border-border-subtle">
            <h3 className="text-sm font-semibold text-white">Нет активного отчета</h3>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto">
              Введите никнейм эксперта выше для поиска в базе или ссылку на профиль для парсинга.
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
