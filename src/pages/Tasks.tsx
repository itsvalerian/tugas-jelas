import React, { useState } from 'react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Plus, Pencil, Trash2, CheckSquare, ChevronDown, ChevronRight, ListPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Task, Subtask, TaskStatus, Priority, RecurrenceType, STATUS_LABELS, PRIORITY_LABELS, RECURRENCE_LABELS } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const Tasks: React.FC = () => {
  const { 
    data, 
    addTask, 
    updateTask, 
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    getSubtasksByTask
  } = useData();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [priority, setPriority] = useState<Priority>('medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [showInCalendar, setShowInCalendar] = useState(true);

  // Subtask form state
  const [subtaskTaskId, setSubtaskTaskId] = useState('');
  const [subtaskTitle, setSubtaskTitle] = useState('');

  const handleOpenTaskDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description);
      setProjectId(task.project_id);
      setStatus(task.status);
      setPriority(task.priority);
      setStartDate(task.start_date || '');
      setDueDate(task.due_date || '');
      setRecurrenceType(task.recurrence_type);
      setRecurrenceEndDate(task.recurrence_end_date || '');
      setShowInCalendar(task.show_in_calendar);
    } else {
      resetTaskForm();
    }
    setIsDialogOpen(true);
  };

  const resetTaskForm = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setProjectId(data.projects[0]?.id || '');
    setStatus('not_started');
    setPriority('medium');
    setStartDate('');
    setDueDate('');
    setRecurrenceType('none');
    setRecurrenceEndDate('');
    setShowInCalendar(true);
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Judul tugas wajib diisi', variant: 'destructive' });
      return;
    }

    if (!projectId) {
      toast({ title: 'Error', description: 'Pilih proyek', variant: 'destructive' });
      return;
    }

    const taskData = {
      title,
      description,
      project_id: projectId,
      status,
      priority,
      start_date: startDate || null,
      due_date: dueDate || null,
      recurrence_type: recurrenceType,
      recurrence_end_date: recurrenceEndDate || null,
      show_in_calendar: showInCalendar,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast({ title: 'Berhasil', description: 'Tugas berhasil diperbarui' });
    } else {
      addTask(taskData);
      toast({ title: 'Berhasil', description: 'Tugas berhasil ditambahkan' });
    }

    setIsDialogOpen(false);
    resetTaskForm();
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast({ title: 'Berhasil', description: 'Tugas berhasil dihapus' });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subtaskTitle.trim()) {
      toast({ title: 'Error', description: 'Judul subtugas wajib diisi', variant: 'destructive' });
      return;
    }

    addSubtask({
      task_id: subtaskTaskId,
      title: subtaskTitle,
      status: 'todo',
    });

    toast({ title: 'Berhasil', description: 'Subtugas berhasil ditambahkan' });
    setIsSubtaskDialogOpen(false);
    setSubtaskTitle('');
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const filteredTasks = data.tasks.filter(task => {
    if (filterProject !== 'all' && task.project_id !== filterProject) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tugas</h1>
          <p className="text-muted-foreground mt-1">Kelola tugas Anda</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Proyek" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Proyek</SelectItem>
              {data.projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenTaskDialog()} disabled={data.projects.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tugas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? 'Edit Tugas' : 'Tambah Tugas'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitTask} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Proyek</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih proyek" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Judul</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul tugas" />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi (opsional)" rows={2} />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Mulai</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Jatuh Tempo</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pengulangan</Label>
                    <Select value={recurrenceType} onValueChange={(v: RecurrenceType) => setRecurrenceType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RECURRENCE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {recurrenceType !== 'none' && (
                    <div className="space-y-2">
                      <Label>Akhir Pengulangan</Label>
                      <Input type="date" value={recurrenceEndDate} onChange={(e) => setRecurrenceEndDate(e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="showInCalendar" checked={showInCalendar} onCheckedChange={(c) => setShowInCalendar(!!c)} />
                  <Label htmlFor="showInCalendar" className="cursor-pointer">Tampilkan di Kalender</Label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                  <Button type="submit">{editingTask ? 'Simpan' : 'Tambah'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Empty State */}
      {data.projects.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Buat Proyek Dulu</h3>
          <p className="text-muted-foreground mt-1">Anda perlu membuat proyek sebelum menambah tugas</p>
          <Link to="/projects">
            <Button className="mt-4">Buat Proyek</Button>
          </Link>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Belum ada tugas</h3>
          <p className="text-muted-foreground mt-1">Mulai dengan membuat tugas pertama Anda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => {
            const project = data.projects.find(p => p.id === task.project_id);
            const subtasks = getSubtasksByTask(task.id);
            const isExpanded = expandedTasks.includes(task.id);
            const completedSubtasks = subtasks.filter(s => s.status === 'done').length;

            return (
              <Collapsible key={task.id} open={isExpanded} onOpenChange={() => toggleExpand(task.id)}>
                <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="p-4 flex items-center gap-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-medium text-foreground">{task.title}</h3>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} showLabel={false} />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{project?.name}</span>
                        {task.due_date && (
                          <span>Jatuh tempo: {format(new Date(task.due_date), 'd MMM yyyy', { locale: id })}</span>
                        )}
                        {subtasks.length > 0 && (
                          <span>{completedSubtasks}/{subtasks.length} subtugas</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubtaskTaskId(task.id);
                          setIsSubtaskDialogOpen(true);
                        }}
                      >
                        <ListPlus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenTaskDialog(task)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Tugas?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus tugas beserta semua subtugas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTask(task.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 pl-16 space-y-2">
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                      {subtasks.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <p className="text-sm font-medium text-foreground">Subtugas:</p>
                          {subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                              <Checkbox
                                checked={subtask.status === 'done'}
                                onCheckedChange={(checked) => {
                                  updateSubtask(subtask.id, { status: checked ? 'done' : 'todo' });
                                }}
                              />
                              <span className={`flex-1 text-sm ${subtask.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {subtask.title}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-6 w-6"
                                onClick={() => {
                                  deleteSubtask(subtask.id);
                                  toast({ title: 'Berhasil', description: 'Subtugas dihapus' });
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Subtask Dialog */}
      <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Subtugas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubtask} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="Judul subtugas" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsSubtaskDialogOpen(false)}>Batal</Button>
              <Button type="submit">Tambah</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
