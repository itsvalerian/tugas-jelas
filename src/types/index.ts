export type TaskStatus = 'not_started' | 'todo' | 'in_progress' | 'hold' | 'done' | 'overdue';
export type Priority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';
export type EventType = 'meeting' | 'reminder' | 'other';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  start_date: string | null;
  due_date: string | null;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  show_in_calendar: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  status: 'todo' | 'done';
  order: number;
  created_at: string;
}

export interface Event {
  id: string;
  project_id: string | null;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  event_type: EventType;
  created_at: string;
}

export interface PersonalTask {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: TaskStatus;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export interface AppData {
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  subtasks: Subtask[];
  events: Event[];
  personalTasks: PersonalTask[];
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Belum Dimulai',
  todo: 'Untuk Dikerjakan',
  in_progress: 'Sedang Dikerjakan',
  hold: 'Ditahan',
  done: 'Selesai',
  overdue: 'Terlambat',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'Tidak Ada',
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meeting: 'Rapat',
  reminder: 'Pengingat',
  other: 'Lainnya',
};
