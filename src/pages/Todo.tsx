import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, ListTodo, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PersonalTask, TaskStatus, Priority, STATUS_LABELS, PRIORITY_LABELS } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { format, isToday, isTomorrow, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

type TabType = 'daily' | 'weekly' | 'monthly' | 'personal';

const TodoPage: React.FC = () => {
  const { data, addPersonalTask, updatePersonalTask, deletePersonalTask } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Personal task form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [priority, setPriority] = useState<Priority>('medium');

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Get all tasks (project + personal) for todo lists
  const allTasks = useMemo(() => {
    const projectTasks = data.tasks.map(t => ({
      ...t,
      isPersonal: false,
      projectName: data.projects.find(p => p.id === t.project_id)?.name || '',
    }));

    const personalTasks = data.personalTasks.map(t => ({
      ...t,
      isPersonal: true,
      projectName: 'Personal',
      project_id: '',
      recurrence_type: 'none' as const,
      recurrence_end_date: null,
      show_in_calendar: false,
      order: 0,
      start_date: null,
    }));

    return [...projectTasks, ...personalTasks];
  }, [data.tasks, data.personalTasks, data.projects]);

  // Filter tasks by date range and filters
  const filteredTasks = useMemo(() => {
    let tasks = allTasks;

    // Filter by date range
    switch (activeTab) {
      case 'daily':
        tasks = tasks.filter(t => t.due_date && isToday(parseISO(t.due_date)));
        break;
      case 'weekly':
        tasks = tasks.filter(t => {
          if (!t.due_date) return false;
          const d = parseISO(t.due_date);
          return d >= weekStart && d <= weekEnd;
        });
        break;
      case 'monthly':
        tasks = tasks.filter(t => {
          if (!t.due_date) return false;
          const d = parseISO(t.due_date);
          return d >= monthStart && d <= monthEnd;
        });
        break;
      case 'personal':
        tasks = tasks.filter(t => t.isPersonal);
        break;
    }

    // Apply filters
    if (filterStatus !== 'all') {
      tasks = tasks.filter(t => t.status === filterStatus);
    }
    if (filterPriority !== 'all') {
      tasks = tasks.filter(t => t.priority === filterPriority);
    }

    return tasks.sort((a, b) => {
      // Sort by priority (high first), then by due date
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return 0;
    });
  }, [allTasks, activeTab, filterStatus, filterPriority, weekStart, weekEnd, monthStart, monthEnd]);

  // Upcoming reminders
  const upcomingReminders = useMemo(() => {
    const tomorrow = addDays(today, 1);
    return allTasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      const d = parseISO(t.due_date);
      return isToday(d) || isTomorrow(d);
    });
  }, [allTasks, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Judul wajib diisi', variant: 'destructive' });
      return;
    }

    addPersonalTask({
      title,
      description,
      due_date: dueDate || null,
      status,
      priority,
    });

    toast({ title: 'Berhasil', description: 'To-Do berhasil ditambahkan' });
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setStatus('not_started');
    setPriority('medium');
  };

  const handleDelete = (id: string) => {
    deletePersonalTask(id);
    toast({ title: 'Berhasil', description: 'To-Do berhasil dihapus' });
  };

  const handleToggleStatus = (task: typeof allTasks[0]) => {
    const newStatus = task.status === 'done' ? 'not_started' : 'done';
    if (task.isPersonal) {
      updatePersonalTask(task.id, { status: newStatus });
    }
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'daily': return 'Harian';
      case 'weekly': return 'Mingguan';
      case 'monthly': return 'Bulanan';
      case 'personal': return 'Personal';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">To-Do List</h1>
          <p className="text-muted-foreground mt-1">Kelola tugas harian Anda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah To-Do Personal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah To-Do Personal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul to-do" />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi (opsional)" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v: TaskStatus) => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioritas</Label>
                  <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button type="submit">Tambah</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reminders Panel */}
      {upcomingReminders.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-foreground">Pengingat</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingReminders.slice(0, 6).map(task => (
              <div key={task.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className={`w-4 h-4 shrink-0 ${isToday(parseISO(task.due_date!)) ? 'text-destructive' : 'text-warning'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {isToday(parseISO(task.due_date!)) ? 'Hari ini' : 'Besok'} • {task.projectName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="bg-card border border-border rounded-xl p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="daily">Harian</TabsTrigger>
              <TabsTrigger value="weekly">Mingguan</TabsTrigger>
              <TabsTrigger value="monthly">Bulanan</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Prioritas</SelectItem>
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Tidak ada tugas</h3>
                <p className="text-muted-foreground mt-1">
                  {activeTab === 'personal' ? 'Tambahkan to-do personal Anda' : `Tidak ada tugas untuk periode ${getTabLabel(activeTab).toLowerCase()}`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors
                      ${task.status === 'overdue' ? 'border-destructive/50' : ''}
                      ${task.due_date && isTomorrow(parseISO(task.due_date)) && task.status !== 'done' ? 'border-warning/50' : ''}
                    `}
                  >
                    {task.isPersonal && (
                      <Checkbox
                        checked={task.status === 'done'}
                        onCheckedChange={() => handleToggleStatus(task)}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`font-medium ${task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {task.title}
                        </span>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} showLabel={false} />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{task.projectName}</span>
                        {task.due_date && (
                          <span>{format(parseISO(task.due_date), 'd MMM yyyy', { locale: id })}</span>
                        )}
                      </div>
                    </div>
                    {task.isPersonal && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus To-Do?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(task.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TodoPage;
