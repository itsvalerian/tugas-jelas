import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2, FolderKanban, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Workspace } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Workspaces: React.FC = () => {
  const { data, addWorkspace, updateWorkspace, deleteWorkspace, getProjectsByWorkspace } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenDialog = (workspace?: Workspace) => {
    if (workspace) {
      setEditingWorkspace(workspace);
      setName(workspace.name);
      setDescription(workspace.description);
    } else {
      setEditingWorkspace(null);
      setName('');
      setDescription('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Nama ruang kerja wajib diisi', variant: 'destructive' });
      return;
    }

    if (editingWorkspace) {
      updateWorkspace(editingWorkspace.id, { name, description });
      toast({ title: 'Berhasil', description: 'Ruang kerja berhasil diperbarui' });
    } else {
      addWorkspace({ name, description });
      toast({ title: 'Berhasil', description: 'Ruang kerja berhasil ditambahkan' });
    }

    setIsDialogOpen(false);
    setName('');
    setDescription('');
    setEditingWorkspace(null);
  };

  const handleDelete = (workspaceId: string) => {
    deleteWorkspace(workspaceId);
    toast({ title: 'Berhasil', description: 'Ruang kerja berhasil dihapus' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ruang Kerja</h1>
          <p className="text-muted-foreground mt-1">Kelola ruang kerja Anda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Ruang Kerja
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingWorkspace ? 'Edit Ruang Kerja' : 'Tambah Ruang Kerja'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama ruang kerja"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi ruang kerja (opsional)"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingWorkspace ? 'Simpan' : 'Tambah'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workspace Grid */}
      {data.workspaces.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Belum ada ruang kerja</h3>
          <p className="text-muted-foreground mt-1">Mulai dengan membuat ruang kerja pertama Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.workspaces.map(workspace => {
            const projects = getProjectsByWorkspace(workspace.id);
            const taskCount = data.tasks.filter(t => 
              projects.some(p => p.id === t.project_id)
            ).length;

            return (
              <div
                key={workspace.id}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FolderKanban className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(workspace)}
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
                          <AlertDialogTitle>Hapus Ruang Kerja?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus ruang kerja beserta semua proyek dan tugas di dalamnya.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(workspace.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{workspace.name}</h3>
                {workspace.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {workspace.description}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{projects.length} Proyek</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{taskCount} Tugas</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Dibuat {format(new Date(workspace.created_at), 'd MMM yyyy', { locale: id })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Workspaces;
