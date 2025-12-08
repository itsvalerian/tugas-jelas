import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Briefcase, 
  CheckSquare, 
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar as CalendarIcon
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { data } = useData();

  // Calculate stats
  const totalWorkspaces = data.workspaces.length;
  const totalProjects = data.projects.length;
  const totalTasks = data.tasks.length;
  const overdueTasks = data.tasks.filter(t => t.status === 'overdue').length;
  const completedTasks = data.tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = data.tasks.filter(t => t.status === 'in_progress').length;

  // Get upcoming tasks (due within 7 days)
  const today = new Date();
  const upcomingTasks = data.tasks
    .filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= today && dueDate <= addDays(today, 7);
    })
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  // Get upcoming events
  const upcomingEvents = data.events
    .filter(e => new Date(e.start_datetime) >= today)
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
    .slice(0, 5);

  const stats = [
    { label: 'Ruang Kerja', value: totalWorkspaces, icon: FolderKanban, color: 'text-primary' },
    { label: 'Proyek', value: totalProjects, icon: Briefcase, color: 'text-info' },
    { label: 'Tugas', value: totalTasks, icon: CheckSquare, color: 'text-success' },
    { label: 'Terlambat', value: overdueTasks, icon: AlertCircle, color: 'text-destructive' },
  ];

  const formatDueDate = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return 'Hari ini';
    if (isTomorrow(d)) return 'Besok';
    return format(d, 'd MMM', { locale: id });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang! Berikut ringkasan proyek Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-muted ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Progres Tugas</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Selesai</span>
                <span className="text-foreground font-medium">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Sedang Dikerjakan</span>
                <span className="text-foreground font-medium">
                  {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-foreground">Tugas Mendatang</h3>
            </div>
            <Link to="/tasks" className="text-sm text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">Tidak ada tugas mendatang</p>
            ) : (
              upcomingTasks.map(task => {
                const project = data.projects.find(p => p.id === task.project_id);
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{project?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} showLabel={false} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDueDate(task.due_date!)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-info" />
              <h3 className="font-semibold text-foreground">Event Mendatang</h3>
            </div>
            <Link to="/calendar" className="text-sm text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">Tidak ada event mendatang</p>
            ) : (
              upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.start_datetime), 'HH:mm', { locale: id })}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.start_datetime), 'd MMM', { locale: id })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Tasks by Status */}
      {overdueTasks > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Tugas Terlambat</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.tasks
              .filter(t => t.status === 'overdue')
              .slice(0, 6)
              .map(task => {
                const project = data.projects.find(p => p.id === task.project_id);
                return (
                  <div key={task.id} className="bg-card border border-border rounded-lg p-4">
                    <p className="font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{project?.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <StatusBadge status={task.status} />
                      {task.due_date && (
                        <span className="text-xs text-destructive">
                          {format(new Date(task.due_date), 'd MMM yyyy', { locale: id })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
