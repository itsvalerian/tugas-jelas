import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { loadUser, saveUser, clearUser } from '@/lib/storage';

// Static credentials for demo
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = loadUser();
    if (storedUser && storedUser.isLoggedIn) {
      setUser(storedUser);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const newUser: User = { username, isLoggedIn: true };
      setUser(newUser);
      saveUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    clearUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user?.isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
