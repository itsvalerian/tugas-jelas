import * as XLSX from 'xlsx';
import { AppData, STATUS_LABELS, PRIORITY_LABELS, RECURRENCE_LABELS } from '@/types';

export const exportProjects = (data: AppData) => {
  const rows = data.projects.map(project => {
    const workspace = data.workspaces.find(w => w.id === project.workspace_id);
    const taskCount = data.tasks.filter(t => t.project_id === project.id).length;
    
    return {
      'ID': project.id.slice(0, 8),
      'Ruang Kerja': workspace?.name || '-',
      'Nama Proyek': project.name,
      'Status': project.status === 'active' ? 'Aktif' : project.status === 'completed' ? 'Selesai' : 'Diarsipkan',
      'Jumlah Tugas': taskCount,
      'Tanggal Dibuat': new Date(project.created_at).toLocaleDateString('id-ID'),
      'Deskripsi': project.description,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Proyek');
  XLSX.writeFile(wb, `proyek_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportTasks = (data: AppData, projectId?: string) => {
  let tasks = data.tasks;
  if (projectId) {
    tasks = tasks.filter(t => t.project_id === projectId);
  }

  const rows = tasks.map(task => {
    const project = data.projects.find(p => p.id === task.project_id);
    const subtaskCount = data.subtasks.filter(s => s.task_id === task.id).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = task.due_date && new Date(task.due_date) < today && task.status !== 'done';

    return {
      'ID': task.id.slice(0, 8),
      'Nama Proyek': project?.name || '-',
      'Nama Tugas': task.title,
      'Deskripsi': task.description,
      'Status': STATUS_LABELS[task.status],
      'Prioritas': PRIORITY_LABELS[task.priority],
      'Tanggal Mulai': task.start_date ? new Date(task.start_date).toLocaleDateString('id-ID') : '-',
      'Tanggal Jatuh Tempo': task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID') : '-',
      'Pengulangan': RECURRENCE_LABELS[task.recurrence_type],
      'Terlambat': isOverdue ? 'Ya' : 'Tidak',
      'Jumlah Subtugas': subtaskCount,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tugas');
  
  const projectName = projectId ? data.projects.find(p => p.id === projectId)?.name || 'tugas' : 'semua_tugas';
  XLSX.writeFile(wb, `${projectName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportTodos = (data: AppData) => {
  const rows = data.personalTasks.map(task => ({
    'Judul': task.title,
    'Deskripsi': task.description,
    'Tanggal': task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID') : '-',
    'Status': STATUS_LABELS[task.status],
    'Prioritas': PRIORITY_LABELS[task.priority],
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'To-Do');
  XLSX.writeFile(wb, `todo_${new Date().toISOString().split('T')[0]}.xlsx`);
};
