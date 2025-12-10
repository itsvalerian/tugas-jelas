import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GanttChart as GanttIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  parseISO, 
  differenceInDays, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  eachDayOfInterval 
} from 'date-fns';
import { id } from 'date-fns/locale';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type TimeFilter = 'week' | 'month';

const GanttPage: React.FC = () => {
  const { data, getTasksByProject } = useData();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get projects filtered by workspace
  const filteredProjects = useMemo(() => {
    if (selectedWorkspaceId === 'all') return data.projects;
    return data.projects.filter(p => p.workspace_id === selectedWorkspaceId);
  }, [data.projects, selectedWorkspaceId]);

  // Get tasks based on selection
  const tasks = useMemo(() => {
    if (selectedProjectId !== 'all') {
      return getTasksByProject(selectedProjectId);
    }
    // Get all tasks from filtered projects
    return data.tasks.filter(t => 
      filteredProjects.some(p => p.id === t.project_id)
    );
  }, [selectedProjectId, filteredProjects, data.tasks, getTasksByProject]);

  // Calculate date range based on time filter
  const dateRange = useMemo(() => {
    let start: Date;
    let end: Date;

    if (timeFilter === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    }

    return {
      start,
      end,
      days: eachDayOfInterval({ start, end }),
    };
  }, [currentDate, timeFilter]);

  const handlePrev = () => {
    if (timeFilter === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (timeFilter === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  // Reset project selection when workspace changes
  const handleWorkspaceChange = (value: string) => {
    setSelectedWorkspaceId(value);
    setSelectedProjectId('all');
  };

  const totalDays = dateRange.days.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'overdue': return 'bg-destructive';
      case 'hold': return 'bg-purple-500';
      default: return 'bg-primary';
    }
  };

  // Filter tasks that are visible in current date range
  const visibleTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.start_date && !t.due_date) return false;
      const taskStart = t.start_date ? parseISO(t.start_date) : parseISO(t.due_date!);
      const taskEnd = t.due_date ? parseISO(t.due_date) : taskStart;
      return taskEnd >= dateRange.start && taskStart <= dateRange.end;
    });
  }, [tasks, dateRange]);

  // Get project name for task
  const getProjectName = (projectId: string) => {
    return data.projects.find(p => p.id === projectId)?.name || '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gantt Chart</h1>
          <p className="text-muted-foreground mt-1">Timeline proyek Anda</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Filter */}
          <Select value={timeFilter} onValueChange={(v: TimeFilter) => setTimeFilter(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Mingguan</SelectItem>
              <SelectItem value="month">Bulanan</SelectItem>
            </SelectContent>
          </Select>

          {/* Workspace Filter */}
          <Select value={selectedWorkspaceId} onValueChange={handleWorkspaceChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ruang Kerja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Ruang Kerja</SelectItem>
              {data.workspaces.map(w => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Project Filter */}
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Proyek" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Proyek</SelectItem>
              {filteredProjects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty State */}
      {data.projects.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <GanttIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Buat Proyek Dulu</h3>
          <p className="text-muted-foreground mt-1">Anda perlu membuat proyek untuk melihat Gantt chart</p>
          <Link to="/projects">
            <Button className="mt-4">Buat Proyek</Button>
          </Link>
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <GanttIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Tidak ada tugas</h3>
          <p className="text-muted-foreground mt-1">
            Tidak ada tugas dalam periode {timeFilter === 'week' ? 'minggu' : 'bulan'} ini
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Navigation Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              {timeFilter === 'week' 
                ? `${format(dateRange.start, 'd MMM', { locale: id })} - ${format(dateRange.end, 'd MMM yyyy', { locale: id })}`
                : format(currentDate, 'MMMM yyyy', { locale: id })
              }
            </h2>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Gantt Chart */}
          <div className="overflow-x-auto scrollbar-thin">
            <div style={{ minWidth: Math.max(800, totalDays * 40) }}>
              {/* Date Header */}
              <div className="flex border-b border-border sticky top-0 bg-card z-10">
                <div className="w-64 shrink-0 p-3 border-r border-border">
                  <span className="text-sm font-medium text-muted-foreground">Tugas</span>
                </div>
                <div className="flex-1">
                  <div className="flex">
                    {dateRange.days.map((day, idx) => (
                      <div
                        key={idx}
                        className="text-center text-xs text-muted-foreground p-2 border-r border-border flex-1"
                        style={{ minWidth: '40px' }}
                      >
                        <div className="font-medium">{format(day, 'd')}</div>
                        <div className="text-[10px]">{format(day, 'EEE', { locale: id })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tasks */}
              {visibleTasks.map(task => {
                const taskStart = task.start_date ? parseISO(task.start_date) : parseISO(task.due_date!);
                const taskEnd = task.due_date ? parseISO(task.due_date) : taskStart;
                
                // Clamp to visible range
                const visibleStart = taskStart < dateRange.start ? dateRange.start : taskStart;
                const visibleEnd = taskEnd > dateRange.end ? dateRange.end : taskEnd;
                
                const startOffset = differenceInDays(visibleStart, dateRange.start);
                const duration = Math.max(differenceInDays(visibleEnd, visibleStart) + 1, 1);
                
                const leftPercent = (startOffset / totalDays) * 100;
                const widthPercent = (duration / totalDays) * 100;
                
                return (
                  <div key={task.id} className="flex border-b border-border hover:bg-accent/30 transition-colors">
                    <div className="w-64 shrink-0 p-3 border-r border-border">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
                        {selectedProjectId === 'all' && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {getProjectName(task.project_id)}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={task.status} className="text-[10px] px-1.5 py-0.5 mt-1" />
                    </div>
                    <div className="flex-1 relative h-16">
                      {/* Grid lines */}
                      <div className="flex h-full absolute inset-0">
                        {dateRange.days.map((_, idx) => (
                          <div
                            key={idx}
                            className="border-r border-border/30 flex-1"
                            style={{ minWidth: '40px' }}
                          />
                        ))}
                      </div>
                      {/* Task bar */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-7 rounded ${getStatusColor(task.status)} opacity-90 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center shadow-sm`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        title={`${task.title} (${task.start_date ? format(parseISO(task.start_date), 'd MMM', { locale: id }) : ''} - ${task.due_date ? format(parseISO(task.due_date), 'd MMM', { locale: id }) : ''})`}
                      >
                        <span className="text-[10px] text-foreground font-medium truncate px-2">
                          {task.title}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <span className="text-muted-foreground">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-muted-foreground">Belum Dimulai</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning" />
          <span className="text-muted-foreground">Sedang Dikerjakan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success" />
          <span className="text-muted-foreground">Selesai</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive" />
          <span className="text-muted-foreground">Terlambat</span>
        </div>
      </div>
    </div>
  );
};

export default GanttPage;
