import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TasksPage } from './components/TasksPage';
import { MemesPage } from './components/MemesPage';
import { MemeGeneratorPage } from './components/MemeGeneratorPage';
import { InstaScoutPage } from './components/InstaScoutPage';
import { WatchdogPage } from './components/WatchdogPage';
import { RosterPage } from './components/RosterPage';
import { CreateTaskModal } from './components/CreateTaskModal';
import { MemeToast } from './components/MemeToast';
import { Task, TaskType, MemeReaction, MemeItem, PersonaItem } from './types';
import { PERSONAS, CURATED_MEMES } from './components/memeData';
import { 
  triggerBeerToast, 
  triggerBoarRoar, 
  triggerKlaxon, 
  playTick 
} from './components/AudioSynthesizer';

const TASK_API = "http://localhost:8081/api/v1/tasks";
const SCAN_API = "http://localhost:8083/api/v1/expert";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('tasks');
  const [taskFilter, setTaskFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [personaIndex, setPersonaIndex] = useState<number>(1);
  const [reactionToast, setReactionToast] = useState<MemeReaction | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedStudioMeme, setSelectedStudioMeme] = useState<MemeItem | null>(null);

  const [backendStatus, setBackendStatus] = useState({ task: false, scan: false });

  // Default tasks fallback
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'demo-1',
      title: 'Сдать лабу №3 по Базам Данных',
      description: 'Горит пожаром до 23:59. Научрук активирует режим отчисления, если не сдать сегодня.',
      taskType: 'UNIVERSITY',
      taskPriority: 'HIGH',
      taskStatus: 'PROCESSING',
      deadline: '2026-11-03'
    },
    {
      id: 'demo-2',
      title: 'Отрегулировать клаксон и вафледрон',
      description: 'Проверить боевой гудок на 140 дБ перед прямым эфиром по запуску эксперта.',
      taskType: 'SELF',
      taskPriority: 'HIGH',
      taskStatus: 'TODO',
      deadline: '2026-11-04'
    },
    {
      id: 'demo-3',
      title: 'Прогрев для курса «Кабан ебаный»',
      description: 'Написать 5 сценариев для рилсов на тему выхода на миллион без выгорания.',
      taskType: 'LAUNCH',
      taskPriority: 'MEDIUM',
      taskStatus: 'PROCESSING',
      deadline: '2026-11-06'
    },
    {
      id: 'demo-4',
      title: 'Сэр похмелье: восстановить водно-солевой баланс',
      description: 'Выпить 2 литра минералки после караоке, подготовиться к созвону с клиентом.',
      taskType: 'SELF',
      taskPriority: 'LOW',
      taskStatus: 'DONE',
      deadline: '2026-11-02'
    }
  ]);

  // Fetch tasks from TaskService (:8081)
  const fetchTasks = async () => {
    try {
      const res = await fetch(TASK_API);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
        }
      }
    } catch {
      // Keep demo tasks if server is offline
    }
  };

  // Health checks
  const checkHealth = async () => {
    let taskOk = false;
    let scanOk = false;

    try {
      const r = await fetch(TASK_API);
      taskOk = r.ok;
    } catch {
      taskOk = false;
    }

    try {
      const r = await fetch(`${SCAN_API}/all`);
      scanOk = r.ok;
    } catch {
      scanOk = false;
    }

    setBackendStatus({ task: taskOk, scan: scanOk });
  };

  useEffect(() => {
    fetchTasks();
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update task status with meme reactions
  const handleUpdateStatus = async (taskId: string, newStatus: Task['taskStatus']) => {
    playTick();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, taskStatus: newStatus } : t));

    // Reactions
    if (newStatus === 'DONE') {
      triggerBeerToast();
      setReactionToast({
        img: '/assets/vlad_11.jpg',
        title: 'ТРИУМФ КАБАНА!',
        quote: '«Задача закрыта! Накрывай поляну, Кабан угощает!»'
      });
    } else if (newStatus === 'PROCESSING') {
      triggerBoarRoar();
      setReactionToast({
        img: '/assets/vlad_1.jpg',
        title: 'КАБАН В ЯРОСТИ!',
        quote: '«Задача взята в работу! Жим 300 кг!»'
      });
    }

    try {
      await fetch(TASK_API, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, type: 'status', newStatus })
      });
    } catch {
      // local state already updated
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    playTick();
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setReactionToast({
      img: '/assets/vlad_8.jpg',
      title: 'ШВАБРА ОПЕРАТИВНАЯ!',
      quote: '«Швабра вымела эту задачу нахуй из бэклога!»'
    });

    try {
      await fetch(`${TASK_API}/${taskId}`, { method: 'DELETE' });
    } catch {
      // local state already updated
    }
  };

  // Create new task
  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    taskType: TaskType;
    taskPriority: Task['taskPriority'];
    deadline: string;
  }) => {
    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: taskData.title,
      description: taskData.description,
      taskType: taskData.taskType,
      taskPriority: taskData.taskPriority,
      taskStatus: 'TODO',
      deadline: taskData.deadline,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    setReactionToast({
      img: '/assets/vlad_6.jpg',
      title: 'НОВАЯ ЗАДАЧА В БАЗЕ!',
      quote: '«Клаксон взведён! До дедлайна ни шагу назад!»'
    });

    try {
      await fetch(TASK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
    } catch {
      // local state already updated
    }
  };

  // Cycle Persona
  const handleCyclePersona = () => {
    playTick();
    const nextIdx = (personaIndex % 12) + 1;
    setPersonaIndex(nextIdx);
    const p = PERSONAS.find(x => x.id === nextIdx) || PERSONAS[0];
    setReactionToast({
      img: p.img,
      title: `ИПОСТАСЬ #${nextIdx}: ${p.title.toUpperCase()}`,
      quote: p.quote
    });
  };

  // Open Meme in Studio
  const handleOpenInStudio = (meme: MemeItem) => {
    setSelectedStudioMeme(meme);
    setCurrentTab('generator');
  };

  // Quick Random Meme
  const handleQuickMeme = () => {
    const rand = CURATED_MEMES[Math.floor(Math.random() * CURATED_MEMES.length)];
    setReactionToast({
      img: rand.photo,
      title: rand.topText,
      quote: `«${rand.bottomText}»`
    });
    triggerKlaxon();
  };

  // Task Counts
  const taskCounts = {
    total: tasks.length,
    urgent: tasks.filter(t => t.taskPriority === 'HIGH' && t.taskStatus !== 'DONE').length,
    university: tasks.filter(t => t.taskType === 'UNIVERSITY').length,
    launch: tasks.filter(t => t.taskType === 'LAUNCH').length,
    self: tasks.filter(t => t.taskType === 'SELF').length
  };

  const currentPersona = PERSONAS.find(p => p.id === personaIndex) || PERSONAS[0];

  return (
    <div className="flex bg-black min-h-screen text-[#ededed]">
      
      {/* Apple-style Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        taskFilter={taskFilter}
        setTaskFilter={setTaskFilter}
        taskCounts={taskCounts}
        backendStatus={backendStatus}
        currentPersonaImg={currentPersona.img}
        onCyclePersona={handleCyclePersona}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <Header
          title={
            currentTab === 'tasks' ? 'Задачи Кабана' :
            currentTab === 'memes' ? 'Мемология Владика' :
            currentTab === 'generator' ? 'Мемогенератор Studio' :
            currentTab === 'scout' ? 'InstaScout AI' :
            currentTab === 'watchdog' ? 'Швабра-Сторож' :
            '12 Ипостасей Владика'
          }
          subtitle={
            currentTab === 'tasks' ? (taskFilter === 'ALL' ? 'Все категории' : taskFilter) :
            currentTab === 'memes' ? '12 боевых мемов' :
            undefined
          }
          taskCount={currentTab === 'tasks' ? taskCounts.total : undefined}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onQuickMeme={handleQuickMeme}
        />

        {/* Tab Views */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto">
          {currentTab === 'tasks' && (
            <TasksPage
              tasks={tasks}
              viewMode={viewMode}
              filter={taskFilter}
              searchQuery={searchQuery}
              onUpdateStatus={handleUpdateStatus}
              onDeleteTask={handleDeleteTask}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          )}

          {currentTab === 'memes' && (
            <MemesPage
              onOpenInStudio={handleOpenInStudio}
              onShowReaction={(img, title, quote) => setReactionToast({ img, title, quote })}
            />
          )}

          {currentTab === 'generator' && (
            <MemeGeneratorPage initialMeme={selectedStudioMeme} />
          )}

          {currentTab === 'scout' && (
            <InstaScoutPage
              onTaskCreatedFromScout={(title, desc) => {
                handleCreateTask({
                  title,
                  description: desc,
                  taskType: 'LAUNCH',
                  taskPriority: 'HIGH',
                  deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
                });
                setCurrentTab('tasks');
              }}
              onShowReaction={(img, title, quote) => setReactionToast({ img, title, quote })}
            />
          )}

          {currentTab === 'watchdog' && (
            <WatchdogPage
              onShowToast={(msg) => setReactionToast({
                img: '/assets/vlad_2.jpg',
                title: 'WATCHDOG АКТИВЕН',
                quote: msg
              })}
            />
          )}

          {currentTab === 'roster' && (
            <RosterPage
              onSelectPersona={(p: PersonaItem) => {
                setPersonaIndex(p.id);
                setReactionToast({
                  img: p.img,
                  title: `РЕЖИМ: ${p.title.toUpperCase()}`,
                  quote: p.quote
                });
                setCurrentTab('tasks');
              }}
            />
          )}
        </main>

      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Meme Reaction Toast */}
      <MemeToast
        reaction={reactionToast}
        onClose={() => setReactionToast(null)}
      />

    </div>
  );
};

export default App;
