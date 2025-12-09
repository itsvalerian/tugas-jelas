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
import { FileSpreadsheet, Download } from 'lucide-react';
import { exportAll } from '@/lib/excel';
import { toast } from '@/hooks/use-toast';

const ExportPage: React.FC = () => {
  const { data } = useData();
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('all');

  const handleExportAll = () => {
    const hasData = data.projects.length > 0 || data.tasks.length > 0 || data.personalTasks.length > 0 || data.events.length > 0;
    
    if (!hasData) {
      toast({ title: 'Error', description: 'Tidak ada data untuk diekspor', variant: 'destructive' });
      return;
    }
    
    exportAll(data, selectedProjectId);
    toast({ title: 'Berhasil', description: 'File berhasil diunduh dengan semua data' });
  };

  const filteredTaskCount = selectedProjectId === 'all' 
    ? data.tasks.length 
    : data.tasks.filter(t => t.project_id === selectedProjectId).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ekspor ke Excel</h1>
        <p className="text-muted-foreground mt-1">Unduh semua data Anda dalam satu file Excel (.xlsx)</p>
      </div>

      {/* Export Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Ekspor Semua Data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              File Excel akan berisi 4 sheet: Proyek, Tugas, To-Do Personal, dan Event
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Filter Tugas berdasarkan Proyek (opsional)
          </label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full max-w-xs">
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

        {/* Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-2xl font-bold text-foreground">{data.projects.length}</p>
            <p className="text-sm text-muted-foreground">Proyek</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{filteredTaskCount}</p>
            <p className="text-sm text-muted-foreground">Tugas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.personalTasks.length}</p>
            <p className="text-sm text-muted-foreground">To-Do Personal</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.events.length}</p>
            <p className="text-sm text-muted-foreground">Event</p>
          </div>
        </div>

        {/* Export Button */}
        <Button onClick={handleExportAll} size="lg" className="w-full">
          <Download className="w-5 h-5 mr-2" />
          Unduh Semua Data
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <h3 className="font-medium text-foreground mb-3">Isi File Excel</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>Sheet Proyek:</strong> ID, Ruang Kerja, Nama, Status, Jumlah Tugas, Tanggal Dibuat, Deskripsi</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>Sheet Tugas:</strong> ID, Nama Proyek, Nama Tugas, Deskripsi, Status, Prioritas, Tanggal Mulai, Tanggal Jatuh Tempo, Pengulangan, Terlambat, Jumlah Subtugas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>Sheet To-Do Personal:</strong> Judul, Deskripsi, Tanggal, Status, Prioritas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>Sheet Event:</strong> ID, Judul, Deskripsi, Tipe, Waktu Mulai, Waktu Selesai, Proyek</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ExportPage;
