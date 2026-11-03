import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Volume2 } from 'lucide-react';
import { playTick, triggerKlaxon } from './AudioSynthesizer';
import { MemeItem } from '../types';

interface MemeGeneratorPageProps {
  initialMeme?: MemeItem | null;
}

const PRESET_PUNCHLINES = [
  { top: "300 КГ ЖИМ НОГАМИ", bottom: "КАБАН ЕБАНЫЙ ЗАКРЫВАЕТ СДЕЛКУ С НОГИ", photo: 1 },
  { top: "ПРЕПОД СПРОСИЛ ПРО ЛАБУ ПО БД", bottom: "ВКЛЮЧАЮ КЛАКСОН НА 140 ДБ ПРЯМО В ДУШУ", photo: 2 },
  { top: "ВЫСОТА 3000 МЕТРОВ", bottom: "ДРОН ПИДРОН ЗАСЁК ПРОГРЕВ КОНКУРЕНТА", photo: 3 },
  { top: "УТРО ПОНЕДЕЛЬНИКА, ПАРА В 8:30", bottom: "СЭР ПОХМЕЛЬЕ НА СВЯЗИ С БАНКОЙ РАССОЛА", photo: 4 },
  { top: "НЕ СХОДИТСЯ ЭКОНОМИКА ЗАПУСКА?", bottom: "АЛКАШ РЕШАЕТ ВСЁ ПОСЛЕ 3-ГО ТОСТА В КАРАОКЕ", photo: 5 },
  { top: "ДО ДЕДЛАЙНА 2 МИНУТЫ", bottom: "ВАФЛЕДРОН ВЫХОДИТ НА СВЕРХЗВУК", photo: 6 },
  { top: "КЛИЕНТ ПРОСИТ СКИДКУ 50%", bottom: "БОЕВОЙ ВАФЛЕДРОН ВЫЕХАЛ К ТЕБЕ НА РАЙОН", photo: 7 },
  { top: "НАУЧРУК ЗАХОДИТ В АУДИТОРИЮ", bottom: "ШВАБРА ВЫМЕТАЕТ БЭКЛОГ ЗА 10 МИНУТ", photo: 8 },
  { top: "РАССОЛ ПОПАЛ В МОЗЖЕЧОК", bottom: "ВТОРОЕ ДЫХАНИЕ: ГИПОТЕЗЫ УРОВНЯ FORBES", photo: 10 },
  { top: "ЛАБЫ СДАНЫ, ЗАПУСК НА 5 ЛЯМОВ ЗАКРЫТ", bottom: "НАКРЫВАЙ ПОЛЯНУ, КАБАН УГОЩАЕТ", photo: 11 },
  { top: "УПАЛ ПРОД НА SPRING BOOT В 4 УТРА?", bottom: "ИСТИННЫЙ КЕНТ СПЕШИТ НА ПОМОЩЬ С ПИВОМ", photo: 12 }
];

export const MemeGeneratorPage: React.FC<MemeGeneratorPageProps> = ({ initialMeme }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number>(initialMeme ? initialMeme.id : 1);
  const [topText, setTopText] = useState<string>(initialMeme ? initialMeme.topText : "КОГДА ЗАКРЫЛ ЗАПУСК НА МИЛЛИОН");
  const [bottomText, setBottomText] = useState<string>(initialMeme ? initialMeme.bottomText : "НО ЗАБЫЛ СДАТЬ ЛАБУ ПО БАЗАМ ДАННЫХ");
  const [memeStyle, setMemeStyle] = useState<'impact' | 'demotivator'>('impact');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (initialMeme) {
      setSelectedPhoto(initialMeme.id);
      setTopText(initialMeme.topText);
      setBottomText(initialMeme.bottomText);
    }
  }, [initialMeme]);

  // Re-render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = `/assets/vlad_${selectedPhoto}.jpg`;
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;

      if (memeStyle === 'demotivator') {
        // Demotivator style
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 600, 600);

        // White border
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.strokeRect(35, 35, 530, 420);

        // Photo
        ctx.drawImage(img, 40, 40, 520, 410);

        // Text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px 'Times New Roman', serif";
        ctx.textAlign = "center";
        wrapText(ctx, topText.toUpperCase(), 300, 495, 520, 30);

        ctx.fillStyle = "#aaaaaa";
        ctx.font = "italic 16px 'Times New Roman', serif";
        wrapText(ctx, bottomText.toUpperCase(), 300, 550, 520, 22);

      } else {
        // Impact Classic style
        ctx.drawImage(img, 0, 0, 600, 600);

        // Top Vignette
        const gradTop = ctx.createLinearGradient(0, 0, 0, 150);
        gradTop.addColorStop(0, "rgba(0,0,0,0.7)");
        gradTop.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradTop;
        ctx.fillRect(0, 0, 600, 150);

        // Bottom Vignette
        const gradBot = ctx.createLinearGradient(0, 450, 0, 600);
        gradBot.addColorStop(0, "rgba(0,0,0,0)");
        gradBot.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = gradBot;
        ctx.fillRect(0, 450, 600, 150);

        // Impact Text
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.textAlign = "center";
        ctx.font = "900 32px 'Oswald', Impact, sans-serif";

        wrapTextImpact(ctx, topText.toUpperCase(), 300, 60, 560, 38);
        wrapTextImpact(ctx, bottomText.toUpperCase(), 300, 530, 560, 38);

        // Subtle watermark
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.textAlign = "right";
        ctx.fillText("ProducerOS • Владик", 585, 588);
      }
    };
  }, [selectedPhoto, topText, bottomText, memeStyle]);

  const wrapTextImpact = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    for (let k = 0; k < lines.length; k++) {
      ctx.strokeText(lines[k].trim(), x, y + (k * lineHeight));
      ctx.fillText(lines[k].trim(), x, y + (k * lineHeight));
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, y);
  };

  const handleDownload = () => {
    playTick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `vladik-meme-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleRandomize = () => {
    playTick();
    const rand = PRESET_PUNCHLINES[Math.floor(Math.random() * PRESET_PUNCHLINES.length)];
    setSelectedPhoto(rand.photo);
    setTopText(rand.top);
    setBottomText(rand.bottom);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>🎨</span> Мемогенератор «Владик Studio»
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Создай мем с лицом кента за 5 секунд. Выбирай любое из 12 фото, накладывай панчлайны и скачивай PNG!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 border border-border-subtle text-xs text-zinc-300 font-mono transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Случайный мем</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-accent-orange hover:bg-orange-400 text-black text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Скачать PNG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Photo Strip */}
          <div className="panel p-4 rounded-xl space-y-2">
            <label className="text-xs font-bold text-white block">1. Выбери фото Владика (1 из 12)</label>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                <div
                  key={num}
                  onClick={() => { playTick(); setSelectedPhoto(num); }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                    selectedPhoto === num ? 'border-accent-orange scale-105' : 'border-zinc-800 hover:border-zinc-500'
                  }`}
                >
                  <img src={`/assets/vlad_${num}.jpg`} alt={`Владик ${num}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Preset Punchlines */}
          <div className="panel p-4 rounded-xl space-y-2">
            <label className="text-xs font-bold text-white block">2. Готовые панчлайны</label>
            <select
              onChange={(e) => {
                const idx = Number(e.target.value);
                if (!isNaN(idx) && PRESET_PUNCHLINES[idx]) {
                  playTick();
                  const p = PRESET_PUNCHLINES[idx];
                  setTopText(p.top);
                  setBottomText(p.bottom);
                  setSelectedPhoto(p.photo);
                }
              }}
              className="w-full bg-surface-100 border border-border-subtle rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-accent-orange font-mono"
            >
              <option value="">-- Выбери готовый мем-панчлайн --</option>
              {PRESET_PUNCHLINES.map((p, idx) => (
                <option key={idx} value={idx}>
                  {p.top} / {p.bottom}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Text */}
          <div className="panel p-4 rounded-xl space-y-3">
            <label className="text-xs font-bold text-white block">3. Свой текст мема</label>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 block mb-1">Верхний текст</span>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="w-full bg-surface-100 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-orange font-mono uppercase"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 block mb-1">Нижний текст</span>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="w-full bg-surface-100 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-orange font-mono uppercase"
              />
            </div>

            {/* Style Selector */}
            <div>
              <span className="text-[10px] font-mono text-zinc-400 block mb-1">Стиль мема</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => { playTick(); setMemeStyle('impact'); }}
                  className={`px-3 py-1.5 rounded transition ${
                    memeStyle === 'impact'
                      ? 'bg-zinc-800 text-white font-bold border border-zinc-600'
                      : 'bg-surface-100 text-zinc-400 border border-border-subtle hover:text-white'
                  }`}
                >
                  Impact Classic
                </button>
                <button
                  type="button"
                  onClick={() => { playTick(); setMemeStyle('demotivator'); }}
                  className={`px-3 py-1.5 rounded transition ${
                    memeStyle === 'demotivator'
                      ? 'bg-zinc-800 text-white font-bold border border-zinc-600'
                      : 'bg-surface-100 text-zinc-400 border border-border-subtle hover:text-white'
                  }`}
                >
                  Демотиватор
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Canvas Preview Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center panel p-6 rounded-2xl space-y-4">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between w-full">
            <span>Предпросмотр мема (Canvas HD)</span>
            <span className="text-accent-green">Экспорт 600×600 px</span>
          </div>

          <div className="relative max-w-full overflow-hidden rounded-xl border border-zinc-800 shadow-2xl bg-black flex items-center justify-center p-2">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-inner" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-orange-400 text-black text-xs font-extrabold transition shadow flex items-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Скачать мем (PNG)</span>
            </button>
            <button
              onClick={triggerKlaxon}
              className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-border-subtle text-xs font-mono text-zinc-300 transition flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-accent-orange" />
              <span>Звук клаксона 140 дБ</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
