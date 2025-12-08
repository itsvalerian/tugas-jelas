import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GanttChart as GanttIcon } from 'lucide-react';
import { format, parseISO, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const GanttPage: React.FC = () => {
  const { data, getTasksByProject } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(data.projects[0]?.id || '');

  const project = data.projects.find(p => p.id === selectedProjectId);
  const tasks = selectedProjectId ? getTasksByProject(selectedProjectId) : [];

  // Calculate date range
  const dateRange = useMemo(() => {
    const tasksWithDates = tasks.filter(t => t.start_date || t.due_date);
    
    if (tasksWithDates.length === 0) {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      return { start, end, days: eachDayOfInterval({ start, end }) };
    }

    let minDate = new Date();
    let maxDate = new Date();

    tasksWithDates.forEach(t => {
      if (t.start_date) {
        const d = parseISO(t.start_date);
        if (d < minDate) minDate = d;
      }
      if (t.due_date) {
        const d = parseISO(t.due_date);
        if (d > maxDate) maxDate = d;
      }
    });

    // Add buffer days
    minDate = addDays(minDate, -3);
    maxDate = addDays(maxDate, 3);

    return {
      start: minDate,
      end: maxDate,
      days: eachDayOfInterval({ start: minDate, end: maxDate }),
    };
  }, [tasks]);

  const totalDays = dateRange.days.length;
  const dayWidth = Math.max(100 / totalDays, 2);

  const getTaskPosition = (startDate: string | null, dueDate: string | null) => {
    const start = startDate ? parseISO(startDate) : parseISO(dueDate!);
    const end = dueDate ? parseISO(dueDate) : start;
    
    const startOffset = differenceInDays(start, dateRange.start);
    const duration = Math.max(differenceInDays(end, start) + 1, 1);

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'overdue': return 'bg-destructive';
      case 'hold': return 'bg-purple-500';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gantt Chart</h1>
          <p className="text-muted-foreground mt-1">Timeline proyek Anda</p>
        </div>
        {data.projects.length > 0 && (
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Pilih proyek" />
            </SelectTrigger>
            <SelectContent>
              {data.projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <GanttIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Belum ada tugas</h3>
          <p className="text-muted-foreground mt-1">Tambahkan tugas dengan tanggal untuk melihat di Gantt chart</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Project Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{project?.name}</h2>
            <p className="text-sm text-muted-foreground">
              {format(dateRange.start, 'd MMM', { locale: id })} - {format(dateRange.end, 'd MMM yyyy', { locale: id })}
            </p>
          </div>

          {/* Gantt Chart */}
          <div className="overflow-x-auto scrollbar-thin">
            <div className="min-w-[800px]">
              {/* Date Header */}
              <div className="flex border-b border-border sticky top-0 bg-card z-10">
                <div className="w-64 shrink-0 p-3 border-r border-border">
                  <span className="text-sm font-medium text-muted-foreground">Tugas</span>
                </div>
                <div className="flex-1 flex">
                  {dateRange.days.map((day, idx) => (
                    <div
                      key={idx}
                      className="text-center text-xs text-muted-foreground p-2 border-r border-border flex-1 min-w-[30px]"
                    >
                      <div>{format(day, 'd')}</div>
                      <div className="text-[10px]">{format(day, 'EEE', { locale: id })}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              {tasks
                .filter(t => t.start_date || t.due_date)
                .map(task => {
                  const position = getTaskPosition(task.start_date, task.due_date);
                  
                  return (
                    <div key={task.id} className="flex border-b border-border hover:bg-accent/30 transition-colors">
                      <div className="w-64 shrink-0 p-3 border-r border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
                          <StatusBadge status={task.status} className="text-[10px] px-1.5 py-0.5" />
                        </div>
                      </div>
                      <div className="flex-1 relative h-12">
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-full ${getStatusColor(task.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                          style={position}
                          title={`${task.title} (${task.start_date ? format(parseISO(task.start_date), 'd MMM', { locale: id }) : ''} - ${task.due_date ? format(parseISO(task.due_date), 'd MMM', { locale: id }) : ''})`}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-foreground font-medium truncate px-2">
                            {task.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Tasks without dates message */}
              {tasks.filter(t => !t.start_date && !t.due_date).length > 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
                  {tasks.filter(t => !t.start_date && !t.due_date).length} tugas tidak memiliki tanggal
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
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
