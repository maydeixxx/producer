import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ExpertData } from '../types';
import { playTick, triggerDronePing } from './AudioSynthesizer';

interface InstaScoutPageProps {
  onTaskCreatedFromScout: (title: string, desc: string) => void;
  onShowReaction: (img: string, title: string, quote: string) => void;
}

export const InstaScoutPage: React.FC<InstaScoutPageProps> = ({ onTaskCreatedFromScout, onShowReaction }) => {
  const [url, setUrl] = useState<string>("https://www.instagram.com/vladik_kaban/");
  const [loading, setLoading] = useState<boolean>(false);
  const [expert, setExpert] = useState<ExpertData>({
    nickname: "vladik_kaban",
    coverage: 1840000,
    targetAud: "Мужчины и женщины 20–35 лет, застрявшие в найме 5/2 и дне сурка. Хотят свободы, удаленной работы и своей финансовой подушки, чтобы иметь право выбора, но боятся потерять стабильность и влезть в долги.",
    needs: [
      'Потеря себя и день сурка — «Каждый день одно и то же, ощущение клетки под соусом бесконечной бытовухи и работы за копейки»',
      'Финансовая уязвимость — «Хочу иметь свою подушку безопасности: деньги для меня это право выбора и защита, а не роскошь»',
      'Синдром самозванца — «Как будто я ничего не могу и не умею, куча страхов, так как сфера совсем новая»',
      'Хронический дефицит сил — «Нет времени и сил, когда прихожу со смены — валюсь с ног, на себя ноль минут»'
    ],
    levers: [
      'Снятие страха «Сфера новая, не знаю как» -> Показать пошаговый путь ученика от точки А до первого чека без заумных терминов.',
      'Возражение «Везде нужны вклады, а денег нет» -> Честная декомпозиция старта с абсолютного нуля без бюджета на одной лишь наглости и харизме.',
      'Страх обмана и «инфоцыганства» -> Твердые артефакты: реальные выписки с банков, видео-отзывы без купюр и показ изнанки.',
      'Возражение «У меня нет времени» -> Формат «День с кентом»: показать, как закрывать задачи за 1–2 часа в день между парами.'
    ]
  });

  const handleAudit = async () => {
    if (!url.trim()) return;
    playTick();
    triggerDronePing();
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8083/api/v1/expert?link=${encodeURIComponent(url)}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setExpert(data);
        onShowReaction('/assets/vlad_3.jpg', `РАЗВЕДКА ЗАВЕРШЕНА: @${data.nickname}`, '«Дрон пидрон зафиксировал охваты и боли ЦА!»');
      } else {
        throw new Error();
      }
    } catch {
      // Demo fallback
      setTimeout(() => {
        onShowReaction('/assets/vlad_3.jpg', 'РАЗВЕДКА ЗАВЕРШЕНА: @vladik_kaban', '«Дрон пидрон зафиксировал 1.84M охватов!»');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    playTick();
    onTaskCreatedFromScout(
      `Запуск эксперта @${expert.nickname}`,
      `Охваты: ${expert.coverage.toLocaleString()}. Сформировать сценарии прогрева по болям ЦА.`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Input panel */}
      <div className="panel p-5 rounded-2xl space-y-3">
        <div className="flex items-center gap-3">
          <img src="/assets/vlad_3.jpg" alt="Дрон" className="w-10 h-10 rounded-lg object-cover border border-zinc-700 shadow" />
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>InstaScout AI: Разведка Дроном</span>
              <span className="badge bg-blue-950/40 text-accent-blue border border-blue-900/50 text-[10px]">Apify + LLM</span>
            </h2>
            <p className="text-[11px] text-zinc-500">Автоматический скрапинг рилсов и CustDev анализ по Даше Моне</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Введи ссылку на инстаграм профиль эксперта..."
            className="flex-1 bg-surface-100 border border-border-subtle focus:border-zinc-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
          />
          <button
            onClick={handleAudit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            {loading ? <span className="animate-spin">🌀</span> : <Search className="w-3.5 h-3.5" />}
            <span>{loading ? 'Сканирую...' : 'Сканировать'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 pt-1">
          <span>Быстрый выбор:</span>
          <button onClick={() => setUrl("https://www.instagram.com/vladik_kaban/")} className="text-zinc-400 hover:text-white underline">@vladik_kaban (Кабан)</button>
          <span>•</span>
          <button onClick={() => setUrl("https://www.instagram.com/shvabra_gudok/")} className="text-zinc-400 hover:text-white underline">@shvabra_gudok (Клаксон)</button>
          <span>•</span>
          <button onClick={() => setUrl("https://www.instagram.com/dron_pidron/")} className="text-zinc-400 hover:text-white underline">@dron_pidron (Дрон)</button>
        </div>
      </div>

      {/* Result Card */}
      <div className="panel p-6 rounded-2xl space-y-6">
        
        {/* Header with stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b1b22]">
          <div className="flex items-center gap-3.5">
            <img src="/assets/vlad_1.jpg" alt="Владик" className="w-14 h-14 rounded-xl object-cover border-2 border-zinc-700 shadow-lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white">{expert.nickname}</span>
                <span className="badge bg-orange-950/40 text-accent-orange border border-orange-900/60 text-[10px]">
                  Кабан ебаный
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">Погоняло: Швабра, гудок, клаксон, вафледрон. Силовой тренинг и пиво.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="panel-inset px-3.5 py-2 rounded-lg text-center">
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Охваты Reels</div>
              <div className="text-sm font-bold text-white font-mono">{expert.coverage.toLocaleString()}</div>
            </div>
            <div className="panel-inset px-3.5 py-2 rounded-lg text-center">
              <div className="text-[10px] text-zinc-500 font-mono uppercase">ER</div>
              <div className="text-sm font-bold text-accent-green font-mono">8.4%</div>
            </div>
            <div className="panel-inset px-3.5 py-2 rounded-lg text-center">
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Виральность</div>
              <div className="text-sm font-bold text-accent-orange font-mono">5.2x</div>
            </div>
          </div>
        </div>

        {/* Meme Verdict */}
        <div className="p-4 rounded-xl panel-inset border border-accent-orange/40 flex items-center gap-4 bg-orange-950/10">
          <img src="/assets/vlad_3.jpg" alt="Дрон" className="w-12 h-12 rounded-lg object-cover border border-zinc-700 shrink-0" />
          <div>
            <div className="text-xs font-bold text-accent-orange uppercase font-mono">Вердикт Дрона-Пидрона:</div>
            <div className="text-xs text-zinc-300 italic mt-0.5">
              «Охваты сочные, эксперт — чистый Кабан. Прогрев через боли ЦА даст конверсию от 14%. Выкатывай воронку!»
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="panel-inset p-4 rounded-xl space-y-1">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Портрет целевой аудитории (CustDev Ядро)</div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {expert.targetAud}
          </p>
        </div>

        {/* Needs vs Levers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pains */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-white flex items-center justify-between pb-1 border-b border-[#1b1b22]">
              <span>Боли аудитории (Живой язык / Verbatim)</span>
              <span className="text-[10px] font-mono text-zinc-500">needs[]</span>
            </div>
            <div className="space-y-2">
              {expert.needs.map((n, i) => (
                <div key={i} className="p-3 rounded-lg panel-inset text-xs leading-relaxed text-zinc-300 italic">
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* Levers */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-white flex items-center justify-between pb-1 border-b border-[#1b1b22]">
              <span>Контентные рычаги влияния</span>
              <span className="text-[10px] font-mono text-zinc-500">levers[]</span>
            </div>
            <div className="space-y-2">
              {expert.levers.map((l, i) => (
                <div key={i} className="p-3 rounded-lg panel-inset text-xs leading-relaxed space-y-1">
                  <span className="text-[10px] font-mono uppercase text-accent-green block">Рычаг контента:</span>
                  <span className="text-zinc-300">{l}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Action */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1b1b22]">
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition shadow"
          >
            + Создать проект запуска в TaskService (:8081)
          </button>
          <div className="text-[11px] font-mono text-zinc-500">
            PostgreSQL :5434 (experts_db)
          </div>
        </div>

      </div>

    </div>
  );
};
