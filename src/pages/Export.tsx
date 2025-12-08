import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileSpreadsheet, Download, Briefcase, CheckSquare, ListTodo } from 'lucide-react';
import { exportProjects, exportTasks, exportTodos } from '@/lib/excel';
import { toast } from '@/hooks/use-toast';

const ExportPage: React.FC = () => {
  const { data } = useData();
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('all');

  const handleExportProjects = () => {
    if (data.projects.length === 0) {
      toast({ title: 'Error', description: 'Tidak ada proyek untuk diekspor', variant: 'destructive' });
      return;
    }
    exportProjects(data);
    toast({ title: 'Berhasil', description: 'File proyek berhasil diunduh' });
  };

  const handleExportTasks = () => {
    const tasks = selectedProjectId === 'all' ? data.tasks : data.tasks.filter(t => t.project_id === selectedProjectId);
    if (tasks.length === 0) {
      toast({ title: 'Error', description: 'Tidak ada tugas untuk diekspor', variant: 'destructive' });
      return;
    }
    exportTasks(data, selectedProjectId === 'all' ? undefined : selectedProjectId);
    toast({ title: 'Berhasil', description: 'File tugas berhasil diunduh' });
  };

  const handleExportTodos = () => {
    if (data.personalTasks.length === 0) {
      toast({ title: 'Error', description: 'Tidak ada to-do untuk diekspor', variant: 'destructive' });
      return;
    }
    exportTodos(data);
    toast({ title: 'Berhasil', description: 'File to-do berhasil diunduh' });
  };

  const exportOptions = [
    {
      title: 'Ekspor Proyek',
      description: 'Ekspor semua proyek dengan informasi workspace, status, dan jumlah tugas',
      icon: Briefcase,
      color: 'text-info bg-info/10',
      count: data.projects.length,
      countLabel: 'proyek',
      action: handleExportProjects,
    },
    {
      title: 'Ekspor Tugas',
      description: 'Ekspor tugas dengan detail status, prioritas, tanggal, dan subtugas',
      icon: CheckSquare,
      color: 'text-success bg-success/10',
      count: selectedProjectId === 'all' ? data.tasks.length : data.tasks.filter(t => t.project_id === selectedProjectId).length,
      countLabel: 'tugas',
      action: handleExportTasks,
      hasProjectFilter: true,
    },
    {
      title: 'Ekspor To-Do Personal',
      description: 'Ekspor semua to-do personal dengan status dan prioritas',
      icon: ListTodo,
      color: 'text-warning bg-warning/10',
      count: data.personalTasks.length,
      countLabel: 'to-do',
      action: handleExportTodos,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ekspor ke Excel</h1>
        <p className="text-muted-foreground mt-1">Unduh data Anda dalam format Excel (.xlsx)</p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {exportOptions.map(({ title, description, icon: Icon, color, count, countLabel, action, hasProjectFilter }) => (
          <div key={title} className="bg-card border border-border rounded-xl p-6 flex flex-col">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>

            {hasProjectFilter && (
              <div className="mb-4">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih proyek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Proyek</SelectItem>
                    {data.projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {count} {countLabel}
              </span>
              <Button onClick={action} disabled={count === 0}>
                <Download className="w-4 h-4 mr-2" />
                Unduh
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Tentang Ekspor</h3>
            <p className="text-sm text-muted-foreground">
              File Excel yang dihasilkan kompatibel dengan Microsoft Excel, Google Sheets, dan aplikasi spreadsheet lainnya.
              Semua data akan diekspor dalam format yang mudah dibaca dengan kolom yang terorganisir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
