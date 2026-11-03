import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TasksPage } from './components/TasksPage';
import { MemesPage } from './components/MemesPage';
import { MemeGeneratorPage } from './components/MemeGeneratorPage';
import { InstaScoutPage } from './components/InstaScoutPage';
import { RosterPage } from './components/RosterPage';
import { CreateTaskModal } from './components/CreateTaskModal';
import { EditTaskModal } from './components/EditTaskModal';
import { MemeToast } from './components/MemeToast';
import { Task, TaskType, MemeReaction, MemeItem, PersonaItem, ExpertData } from './types';
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

  // Edit Task State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState<boolean>(false);

  const [backendStatus, setBackendStatus] = useState({ task: false, scan: false });

  // Real Database Tasks & Experts
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<ExpertData | null>(null);

  // Fetch real tasks from TaskService (:8081) with backend title search
  const fetchTasks = async (query?: string) => {
    try {
      const q = query !== undefined ? query.trim() : searchQuery.trim();
      const url = q ? `${TASK_API}/title?title=${encodeURIComponent(q)}` : TASK_API;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTasks(data);
        }
      } else if (res.status === 404 || res.status === 400) {
        setTasks([]);
      }
    } catch {
      // Backend offline
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Fetch real experts from ScanService (:8083)
  const fetchExperts = async () => {
    try {
      const res = await fetch(`${SCAN_API}/all`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setExperts(data);
        }
      }
    } catch {
      // Backend offline
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

  // Debounced search for tasks by title
  useEffect(() => {
    if (currentTab === 'tasks') {
      const timer = setTimeout(() => {
        fetchTasks(searchQuery);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, currentTab]);

  useEffect(() => {
    fetchTasks();
    fetchExperts();
    checkHealth();
    const interval = setInterval(() => {
      checkHealth();
      fetchExperts();
      if (currentTab !== 'tasks' || !searchQuery.trim()) {
        fetchTasks();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [searchQuery, currentTab]);

  // Update task status with meme reactions & real DB sync
  const handleUpdateStatus = async (taskId: string, newStatus: Task['taskStatus']) => {
    playTick();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, taskStatus: newStatus } : t));

    if (newStatus === 'DONE') {
      triggerBeerToast();
      setReactionToast({
        img: '/assets/vlad_11.jpg',
        title: 'ТРИУМФ КАБАНА!',
        quote: '«Задача закрыта! Накрывай поляну!»'
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
      const res = await fetch(TASK_API, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, type: 'status', newStatus })
      });
      if (res.ok) {
        await fetchTasks();
      }
    } catch {
      //
    }
  };

  // Full Task Editing (Title, Description, Priority, Status, Deadline)
  const handleSaveTaskEdits = async (taskId: string, updates: Partial<Task>) => {
    playTick();
    const current = tasks.find(t => t.id === taskId);
    if (!current) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

    const promises: Promise<Response>[] = [];

    if (updates.title && updates.title !== current.title) {
      promises.push(
        fetch(TASK_API, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, type: 'title', newTitle: updates.title })
        })
      );
    }
    if (updates.description !== undefined && updates.description !== current.description) {
      promises.push(
        fetch(TASK_API, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, type: 'description', newDescription: updates.description })
        })
      );
    }
    if (updates.taskStatus && updates.taskStatus !== current.taskStatus) {
      promises.push(
        fetch(TASK_API, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, type: 'status', newStatus: updates.taskStatus })
        })
      );
    }
    if (updates.taskPriority && updates.taskPriority !== current.taskPriority) {
      promises.push(
        fetch(TASK_API, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, type: 'priority', newPriority: updates.taskPriority })
        })
      );
    }
    if (updates.deadline && updates.deadline !== current.deadline) {
      promises.push(
        fetch(TASK_API, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, type: 'deadline', newDeadline: updates.deadline })
        })
      );
    }

    try {
      await Promise.all(promises);
      await fetchTasks();
      setReactionToast({
        img: '/assets/vlad_10.jpg',
        title: 'ЗАДАЧА ОБНОВЛЕНА!',
        quote: '«Все изменения сохранены в системе!»'
      });
    } catch {
      //
    }
  };

  // Delete task from DB
  const handleDeleteTask = async (taskId: string) => {
    playTick();
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setReactionToast({
      img: '/assets/vlad_8.jpg',
      title: 'ШВАБРА ОПЕРАТИВНАЯ!',
      quote: '«Швабра вымела задачу из списка!»'
    });

    try {
      const res = await fetch(`${TASK_API}/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchTasks();
      }
    } catch {
      //
    }
  };

  // Create new task in DB
  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    taskType: TaskType;
    taskPriority: Task['taskPriority'];
    deadline: string;
  }) => {
    playTick();

    const payload = {
      title: taskData.title,
      description: taskData.description.trim() || 'Создано из ProducerOS',
      taskType: taskData.taskType,
      taskPriority: taskData.taskPriority,
      deadline: taskData.deadline || new Date().toISOString().split('T')[0]
    };

    setReactionToast({
      img: '/assets/vlad_6.jpg',
      title: 'НОВАЯ ЗАДАЧА!',
      quote: '«Задача успешно добавлена! Клаксон взведён!»'
    });

    try {
      const res = await fetch(TASK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchTasks();
      }
    } catch {
      //
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

  // Task Counts from REAL tasks
  const taskCounts = {
    total: tasks.length,
    urgent: tasks.filter(t => t.taskPriority === 'HIGH' && t.taskStatus !== 'DONE').length,
    university: tasks.filter(t => t.taskType === 'UNIVERSITY').length,
    launch: tasks.filter(t => t.taskType === 'LAUNCH').length,
    self: tasks.filter(t => t.taskType === 'SELF').length
  };

  const currentPersona = PERSONAS.find(p => p.id === personaIndex) || PERSONAS[0];

  return (
    <div className="flex bg-surface-0 min-h-screen text-[#f2f2f7]">
      
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
            currentTab === 'tasks' ? 'Tasks Кабана' :
            currentTab === 'memes' ? 'Мемология Владика' :
            currentTab === 'generator' ? 'Мемогенератор Studio' :
            currentTab === 'scout' ? 'InstaScout AI' :
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
          currentTab={currentTab}
          tasks={tasks}
          experts={experts}
          onSelectTask={(t) => {
            setEditingTask(t);
            setIsEditTaskModalOpen(true);
          }}
          onSelectExpert={(e) => {
            setSelectedExpert(e);
            setCurrentTab('scout');
          }}
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
              onEditTask={(t) => {
                setEditingTask(t);
                setIsEditTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onClearSearch={() => setSearchQuery('')}
              isLoading={isLoadingTasks}
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
              externalSearchQuery={currentTab === 'scout' ? searchQuery : ''}
              onClearExternalSearch={() => setSearchQuery('')}
              selectedExpert={selectedExpert}
              onSelectExpert={setSelectedExpert}
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

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTaskEdits}
        onDelete={handleDeleteTask}
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
