import React from 'react';
import { Bell, Volume2, Send } from 'lucide-react';
import { playTick, triggerKlaxon } from './AudioSynthesizer';

interface WatchdogPageProps {
  onShowToast: (msg: string) => void;
}

export const WatchdogPage: React.FC<WatchdogPageProps> = ({ onShowToast }) => {
  const handleTestDigest = () => {
    playTick();
    onShowToast("Тестовый дайджест успешно отправлен в Telegram Bot!");
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Watchdog Status */}
        <div className="panel p-5 rounded-2xl space-y-4 md:col-span-1">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1b1b22]">
            <img src="/assets/vlad_2.jpg" alt="Швабра" className="w-10 h-10 rounded-lg object-cover border border-zinc-700 shadow" />
            <div>
              <h2 className="text-sm font-bold text-white">Швабра-Сторож</h2>
              <p className="text-[10px] text-zinc-500 font-mono">Telegram Watchdog Bot</p>
            </div>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Утренний дайджест:</span>
              <span className="text-white">10:00:00</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Вечерний алерт:</span>
              <span className="text-white">19:00:00</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Критерий дедлайна:</span>
              <span className="text-accent-red font-bold">≤ 24 часа</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Критерий зависания:</span>
              <span className="text-accent-orange font-bold">≥ 3 дней</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1b1b22] space-y-2">
            <button
              onClick={handleTestDigest}
              className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition shadow flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Тестовый дайджест в TG</span>
            </button>
            <button
              onClick={triggerKlaxon}
              className="w-full py-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-zinc-300 text-xs font-mono transition border border-border-subtle flex items-center justify-center gap-2"
            >
              <Volume2 className="w-3.5 h-3.5 text-accent-orange" />
              <span>Проверить боевой клаксон</span>
            </button>
          </div>
        </div>

        {/* Telegram Template Preview */}
        <div className="panel p-5 rounded-2xl space-y-3 md:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b1b22]">
            <span className="text-xs font-semibold text-white">Шаблон сообщения Telegram Bot API (HTML)</span>
            <span className="text-[10px] font-mono text-zinc-500">Consumer: NotificationService</span>
          </div>

          <div className="panel-inset p-4 rounded-xl font-mono text-xs text-zinc-300 space-y-3 leading-relaxed">
            <div className="text-white font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent-orange" />
              <span>ProducerOS: Утренний дайджест</span>
            </div>
            <div>
              <span className="text-accent-red font-semibold">🔥 Горят дедлайны:</span><br />
              • [Универ] Сдать лабу №3 по БД (<span className="text-accent-red font-bold">до 23:59!</span>)<br />
              • [Владик] Отрегулировать клаксон и вафледрон (до завтра)
            </div>
            <div>
              <span className="text-accent-orange font-semibold">⚠️ Зависшие задачи (&gt; 3 дней без движения):</span><br />
              • [Запуск] Прогрев для курса «Кабан ебаный» (висит 4 дня)<br />
              • [Личное] Сэр похмелье: восстановить водно-солевой баланс (висит 3 дня)
            </div>
            <div className="text-zinc-500 italic pt-2 border-t border-zinc-900">
              «БРАТАН, У ТЕБЯ ЗАДАЧА ПРОСТАИВАЕТ, ДАВАЙ ИСПРАВЛЯЙ! Хорошего и продуктивного дня! 🚀»
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
