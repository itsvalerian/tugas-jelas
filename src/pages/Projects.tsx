import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2, Briefcase, CheckSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Project } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const Projects: React.FC = () => {
  const { data, addProject, updateProject, deleteProject, getTasksByProject } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [filterWorkspace, setFilterWorkspace] = useState<string>('all');

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setName(project.name);
      setDescription(project.description);
      setWorkspaceId(project.workspace_id);
      setStatus(project.status);
    } else {
      setEditingProject(null);
      setName('');
      setDescription('');
      setWorkspaceId(data.workspaces[0]?.id || '');
      setStatus('active');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Nama proyek wajib diisi', variant: 'destructive' });
      return;
    }

    if (!workspaceId) {
      toast({ title: 'Error', description: 'Pilih ruang kerja', variant: 'destructive' });
      return;
    }

    if (editingProject) {
      updateProject(editingProject.id, { name, description, workspace_id: workspaceId, status });
      toast({ title: 'Berhasil', description: 'Proyek berhasil diperbarui' });
    } else {
      addProject({ name, description, workspace_id: workspaceId, status });
      toast({ title: 'Berhasil', description: 'Proyek berhasil ditambahkan' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setWorkspaceId('');
    setStatus('active');
    setEditingProject(null);
  };

  const handleDelete = (projectId: string) => {
    deleteProject(projectId);
    toast({ title: 'Berhasil', description: 'Proyek berhasil dihapus' });
  };

  const filteredProjects = filterWorkspace === 'all' 
    ? data.projects 
    : data.projects.filter(p => p.workspace_id === filterWorkspace);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'completed': return 'Selesai';
      case 'archived': return 'Diarsipkan';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success';
      case 'completed': return 'bg-primary/20 text-primary';
      case 'archived': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proyek</h1>
          <p className="text-muted-foreground mt-1">Kelola proyek Anda</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filterWorkspace} onValueChange={setFilterWorkspace}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Ruang Kerja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Ruang Kerja</SelectItem>
              {data.workspaces.map(w => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} disabled={data.workspaces.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Proyek
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Edit Proyek' : 'Tambah Proyek'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="workspace">Ruang Kerja</Label>
                  <Select value={workspaceId} onValueChange={setWorkspaceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ruang kerja" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.workspaces.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama proyek"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi proyek (opsional)"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v: 'active' | 'completed' | 'archived') => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="archived">Diarsipkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingProject ? 'Simpan' : 'Tambah'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Empty State */}
      {data.workspaces.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Buat Ruang Kerja Dulu</h3>
          <p className="text-muted-foreground mt-1">Anda perlu membuat ruang kerja sebelum menambah proyek</p>
          <Link to="/workspaces">
            <Button className="mt-4">Buat Ruang Kerja</Button>
          </Link>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Belum ada proyek</h3>
          <p className="text-muted-foreground mt-1">Mulai dengan membuat proyek pertama Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => {
            const workspace = data.workspaces.find(w => w.id === project.workspace_id);
            const tasks = getTasksByProject(project.id);
            const completedTasks = tasks.filter(t => t.status === 'done').length;

            return (
              <div
                key={project.id}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-info/10">
                    <Briefcase className="w-6 h-6 text-info" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(project)}
                    >
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
                          <AlertDialogTitle>Hapus Proyek?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus proyek beserta semua tugas di dalamnya.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(project.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{workspace?.name}</p>
                
                {project.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {completedTasks}/{tasks.length} Tugas Selesai
                  </span>
                </div>

                {tasks.length > 0 && (
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all duration-500"
                      style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Dibuat {format(new Date(project.created_at), 'd MMM yyyy', { locale: id })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
