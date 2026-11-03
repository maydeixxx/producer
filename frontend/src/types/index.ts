export type TaskStatus = 'TODO' | 'PROCESSING' | 'DONE';
export type TaskType = 'UNIVERSITY' | 'LAUNCH' | 'SELF';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description?: string;
  taskType: TaskType;
  taskPriority: TaskPriority;
  taskStatus: TaskStatus;
  deadline?: string;
  createdAt?: string;
}

export interface ExpertData {
  nickname: string;
  coverage: number;
  targetAud: string;
  needs: string[];
  levers: string[];
}

export interface MemeItem {
  id: number;
  photo: string;
  topText: string;
  bottomText: string;
  tag: string;
  category: 'kaban' | 'shvabra' | 'dron' | 'pohmel';
  likes: number;
}

export interface PersonaItem {
  id: number;
  title: string;
  badge: string;
  img: string;
  quote: string;
  stat: string;
}

export interface MemeReaction {
  img: string;
  title: string;
  quote: string;
}
