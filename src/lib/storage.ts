import { AppData, User } from '@/types';

const DATA_KEY = 'task_manager_data';
const USER_KEY = 'task_manager_user';

const defaultData: AppData = {
  workspaces: [],
  projects: [],
  tasks: [],
  subtasks: [],
  events: [],
  personalTasks: [],
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(DATA_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultData;
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultData;
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const loadUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
};

export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const clearUser = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing user:', error);
  }
};

export const resetAllData = (): void => {
  try {
    localStorage.removeItem(DATA_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error resetting data:', error);
  }
};
