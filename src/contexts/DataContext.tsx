import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppData, Workspace, Project, Task, Subtask, Event, PersonalTask, TaskStatus } from '@/types';
import { loadData, saveData } from '@/lib/storage';

interface DataContextType {
  data: AppData;
  // Workspace
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  // Project
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Task
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  // Subtask
  addSubtask: (subtask: Omit<Subtask, 'id' | 'created_at' | 'order'>) => void;
  updateSubtask: (id: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (id: string) => void;
  // Event
  addEvent: (event: Omit<Event, 'id' | 'created_at'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  // Personal Task
  addPersonalTask: (task: Omit<PersonalTask, 'id' | 'created_at' | 'updated_at'>) => void;
  updatePersonalTask: (id: string, updates: Partial<PersonalTask>) => void;
  deletePersonalTask: (id: string) => void;
  // Helpers
  getProjectsByWorkspace: (workspaceId: string) => Project[];
  getTasksByProject: (projectId: string) => Task[];
  getSubtasksByTask: (taskId: string) => Subtask[];
  checkOverdueTasks: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Check for overdue tasks
  const checkOverdueTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => {
        if (task.due_date && task.status !== 'done') {
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate < today) {
            return { ...task, status: 'overdue' as TaskStatus };
          }
        }
        return task;
      }),
      personalTasks: prev.personalTasks.map(task => {
        if (task.due_date && task.status !== 'done') {
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate < today) {
            return { ...task, status: 'overdue' as TaskStatus };
          }
        }
        return task;
      }),
    }));
  };

  useEffect(() => {
    checkOverdueTasks();
  }, []);

  // Workspace CRUD
  const addWorkspace = (workspace: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newWorkspace: Workspace = {
      ...workspace,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };
    setData(prev => ({ ...prev, workspaces: [...prev.workspaces, newWorkspace] }));
  };

  const updateWorkspace = (id: string, updates: Partial<Workspace>) => {
    setData(prev => ({
      ...prev,
      workspaces: prev.workspaces.map(w =>
        w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w
      ),
    }));
  };

  const deleteWorkspace = (id: string) => {
    setData(prev => {
      const projectIds = prev.projects.filter(p => p.workspace_id === id).map(p => p.id);
      const taskIds = prev.tasks.filter(t => projectIds.includes(t.project_id)).map(t => t.id);
      return {
        ...prev,
        workspaces: prev.workspaces.filter(w => w.id !== id),
        projects: prev.projects.filter(p => p.workspace_id !== id),
        tasks: prev.tasks.filter(t => !projectIds.includes(t.project_id)),
        subtasks: prev.subtasks.filter(s => !taskIds.includes(s.task_id)),
        events: prev.events.filter(e => !projectIds.includes(e.project_id || '')),
      };
    });
  };

  // Project CRUD
  const addProject = (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ),
    }));
  };

  const deleteProject = (id: string) => {
    setData(prev => {
      const taskIds = prev.tasks.filter(t => t.project_id === id).map(t => t.id);
      return {
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        tasks: prev.tasks.filter(t => t.project_id !== id),
        subtasks: prev.subtasks.filter(s => !taskIds.includes(s.task_id)),
        events: prev.events.filter(e => e.project_id !== id),
      };
    });
  };

  // Task CRUD
  const addTask = (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>) => {
    const now = new Date().toISOString();
    const maxOrder = Math.max(0, ...data.tasks.filter(t => t.project_id === task.project_id).map(t => t.order));
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      order: maxOrder + 1,
      created_at: now,
      updated_at: now,
    };
    setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ),
    }));
  };

  const deleteTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
      subtasks: prev.subtasks.filter(s => s.task_id !== id),
    }));
  };

  // Subtask CRUD
  const addSubtask = (subtask: Omit<Subtask, 'id' | 'created_at' | 'order'>) => {
    const maxOrder = Math.max(0, ...data.subtasks.filter(s => s.task_id === subtask.task_id).map(s => s.order));
    const newSubtask: Subtask = {
      ...subtask,
      id: uuidv4(),
      order: maxOrder + 1,
      created_at: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, subtasks: [...prev.subtasks, newSubtask] }));
  };

  const updateSubtask = (id: string, updates: Partial<Subtask>) => {
    setData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubtask = (id: string) => {
    setData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== id),
    }));
  };

  // Event CRUD
  const addEvent = (event: Omit<Event, 'id' | 'created_at'>) => {
    const newEvent: Event = {
      ...event,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, events: [...prev.events, newEvent] }));
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteEvent = (id: string) => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id),
    }));
  };

  // Personal Task CRUD
  const addPersonalTask = (task: Omit<PersonalTask, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newTask: PersonalTask = {
      ...task,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };
    setData(prev => ({ ...prev, personalTasks: [...prev.personalTasks, newTask] }));
  };

  const updatePersonalTask = (id: string, updates: Partial<PersonalTask>) => {
    setData(prev => ({
      ...prev,
      personalTasks: prev.personalTasks.map(t =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ),
    }));
  };

  const deletePersonalTask = (id: string) => {
    setData(prev => ({
      ...prev,
      personalTasks: prev.personalTasks.filter(t => t.id !== id),
    }));
  };

  // Helper functions
  const getProjectsByWorkspace = (workspaceId: string) =>
    data.projects.filter(p => p.workspace_id === workspaceId);

  const getTasksByProject = (projectId: string) =>
    data.tasks.filter(t => t.project_id === projectId).sort((a, b) => a.order - b.order);

  const getSubtasksByTask = (taskId: string) =>
    data.subtasks.filter(s => s.task_id === taskId).sort((a, b) => a.order - b.order);

  return (
    <DataContext.Provider
      value={{
        data,
        addWorkspace,
        updateWorkspace,
        deleteWorkspace,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        addEvent,
        updateEvent,
        deleteEvent,
        addPersonalTask,
        updatePersonalTask,
        deletePersonalTask,
        getProjectsByWorkspace,
        getTasksByProject,
        getSubtasksByTask,
        checkOverdueTasks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
