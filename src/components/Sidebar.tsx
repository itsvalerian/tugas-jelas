import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  CheckSquare,
  Calendar,
  GanttChart,
  ListTodo,
  FileSpreadsheet,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/workspaces', label: 'Ruang Kerja', icon: FolderKanban },
  { path: '/projects', label: 'Proyek', icon: Briefcase },
  { path: '/tasks', label: 'Tugas', icon: CheckSquare },
  { path: '/calendar', label: 'Kalender', icon: Calendar },
  { path: '/gantt', label: 'Gantt', icon: GanttChart },
  { path: '/todo', label: 'To-Do', icon: ListTodo },
  { path: '/export', label: 'Ekspor', icon: FileSpreadsheet },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
        <p className="text-xs text-muted-foreground mt-1">Manajemen Proyek</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn('sidebar-item', isActive && 'sidebar-item-active')
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{user?.username}</p>
            <p className="text-xs text-muted-foreground">Owner</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-item w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
};
