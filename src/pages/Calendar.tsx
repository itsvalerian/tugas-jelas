import React, { useState, useMemo } from 'react';
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
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { id } from 'date-fns/locale';
import { EventType, EVENT_TYPE_LABELS, Task } from '@/types';

type ViewMode = 'month' | 'week' | 'day';

const CalendarPage: React.FC = () => {
  const { data, addEvent, updateEvent, deleteEvent } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDateTime, setEventStartDateTime] = useState('');
  const [eventEndDateTime, setEventEndDateTime] = useState('');
  const [eventType, setEventType] = useState<EventType>('other');
  const [eventProjectId, setEventProjectId] = useState('');

  // Get calendar items (tasks + events)
  type CalendarItem = {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: 'task' | 'event';
    color: string;
    originalItem: Task | typeof data.events[0];
  };

  const calendarItems = useMemo((): CalendarItem[] => {
    const items: CalendarItem[] = [];

    // Add tasks - spanning from start_date to due_date
    data.tasks.forEach(task => {
      if (!task.show_in_calendar) return;
      
      const startDate = task.start_date ? parseISO(task.start_date) : null;
      const endDate = task.due_date ? parseISO(task.due_date) : null;
      
      if (startDate || endDate) {
        items.push({
          id: task.id,
          title: task.title,
          startDate: startDate || endDate!,
          endDate: endDate || startDate!,
          type: 'task',
          color: task.status === 'done' ? 'bg-success/20 text-success border-success/30' :
                 task.status === 'overdue' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                 'bg-primary/20 text-primary border-primary/30',
          originalItem: task,
        });
      }
    });

    // Add events
    data.events.forEach(event => {
      items.push({
        id: event.id,
        title: event.title,
        startDate: parseISO(event.start_datetime),
        endDate: parseISO(event.end_datetime),
        type: 'event',
        color: event.event_type === 'meeting' ? 'bg-info/20 text-info border-info/30' :
               event.event_type === 'reminder' ? 'bg-warning/20 text-warning border-warning/30' :
               'bg-purple-500/20 text-purple-400 border-purple-500/30',
        originalItem: event,
      });
    });

    return items;
  }, [data.tasks, data.events]);

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, "yyyy-MM-dd'T'HH:mm");
    setEventStartDateTime(dateStr.slice(0, 16));
    setEventEndDateTime(dateStr.slice(0, 16));
    setIsEventDialogOpen(true);
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventTitle.trim()) return;

    addEvent({
      title: eventTitle,
      description: eventDescription,
      start_datetime: eventStartDateTime,
      end_datetime: eventEndDateTime || eventStartDateTime,
      event_type: eventType,
      project_id: eventProjectId || null,
    });

    setIsEventDialogOpen(false);
    resetEventForm();
  };

  const resetEventForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventStartDateTime('');
    setEventEndDateTime('');
    setEventType('other');
    setEventProjectId('');
    setSelectedDate(null);
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // Check if a date falls within an item's date range
  const getItemsForDate = (date: Date) => {
    return calendarItems.filter(item => {
      const itemStart = new Date(item.startDate.getFullYear(), item.startDate.getMonth(), item.startDate.getDate());
      const itemEnd = new Date(item.endDate.getFullYear(), item.endDate.getMonth(), item.endDate.getDate());
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return checkDate >= itemStart && checkDate <= itemEnd;
    });
  };

  // Check position of date within item's range for styling
  const getItemPosition = (item: CalendarItem, date: Date): 'start' | 'middle' | 'end' | 'single' => {
    const isStart = isSameDay(item.startDate, date);
    const isEnd = isSameDay(item.endDate, date);
    if (isStart && isEnd) return 'single';
    if (isStart) return 'start';
    if (isEnd) return 'end';
    return 'middle';
  };

  const getPositionClasses = (position: 'start' | 'middle' | 'end' | 'single') => {
    switch (position) {
      case 'start': return 'rounded-l border-l border-t border-b';
      case 'middle': return 'border-t border-b';
      case 'end': return 'rounded-r border-r border-t border-b';
      case 'single': return 'rounded border';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kalender</h1>
          <p className="text-muted-foreground mt-1">Lihat tugas dan event Anda</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(v: ViewMode) => setViewMode(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Bulanan</SelectItem>
              <SelectItem value="week">Mingguan</SelectItem>
              <SelectItem value="day">Harian</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleDateClick(new Date())}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Event
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold text-foreground">
            {format(currentDate, viewMode === 'day' ? 'd MMMM yyyy' : 'MMMM yyyy', { locale: id })}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Month View */}
        {viewMode === 'month' && (
          <div>
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(d => (
                <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((date, idx) => {
                const dayItems = getItemsForDate(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isCurrentDay = isToday(date);

                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(date)}
                    className={`min-h-24 p-1 border-t border-l border-border cursor-pointer transition-colors hover:bg-accent/30
                      ${idx % 7 === 6 ? 'border-r' : ''}
                      ${idx >= days.length - 7 ? 'border-b' : ''}
                      ${!isCurrentMonth ? 'opacity-40 bg-muted/20' : ''}
                      ${isCurrentDay ? 'bg-primary/10' : ''}
                    `}
                  >
                    <span className={`text-sm font-medium block mb-1 ${isCurrentDay ? 'text-primary' : 'text-foreground'}`}>
                      {format(date, 'd')}
                    </span>
                    <div className="space-y-0.5">
                      {dayItems.slice(0, 3).map(item => {
                        const position = getItemPosition(item, date);
                        const positionClasses = getPositionClasses(position);
                        const showTitle = position === 'start' || position === 'single';
                        return (
                          <div
                            key={item.id}
                            className={`text-xs h-5 flex items-center overflow-hidden ${item.color} ${positionClasses}`}
                            style={{ 
                              marginLeft: position === 'middle' || position === 'end' ? '-4px' : '0',
                              marginRight: position === 'middle' || position === 'start' ? '-4px' : '0',
                              paddingLeft: position === 'middle' || position === 'end' ? '6px' : '4px',
                              paddingRight: '4px'
                            }}
                          >
                            {showTitle && <span className="truncate font-medium">{item.title}</span>}
                          </div>
                        );
                      })}
                      {dayItems.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-1">
                          +{dayItems.length - 3} lagi
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)).map((date, idx) => {
                const dayItems = getItemsForDate(date);
                const isCurrentDay = isToday(date);

                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(date)}
                    className={`min-h-48 p-3 border border-border rounded-lg cursor-pointer transition-colors hover:bg-accent/50
                      ${isCurrentDay ? 'border-primary bg-primary/5' : ''}
                    `}
                  >
                    <div className="text-center mb-3">
                      <span className="text-xs text-muted-foreground">{weekDays[idx]}</span>
                      <p className={`text-lg font-semibold ${isCurrentDay ? 'text-primary' : 'text-foreground'}`}>
                        {format(date, 'd')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {dayItems.map(item => (
                        <div
                          key={item.id}
                          className={`text-xs p-2 rounded border ${item.color}`}
                        >
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-[10px] opacity-75 mt-0.5">
                            {item.type === 'task' ? 'Tugas' : 'Event'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="p-4">
            <div className={`min-h-96 border border-border rounded-lg p-4 ${isToday(currentDate) ? 'border-primary' : ''}`}>
              <div className="space-y-3">
                {getItemsForDate(currentDate).length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada jadwal untuk hari ini</p>
                  </div>
                ) : (
                  getItemsForDate(currentDate).map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${item.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{item.title}</h3>
                        <span className="text-xs opacity-75">
                          {item.type === 'task' ? 'Tugas' : 'Event'}
                        </span>
                      </div>
                      {item.type === 'event' && (
                        <p className="text-sm mt-1 opacity-75">
                          {format(parseISO((item.originalItem as typeof data.events[0]).start_datetime), 'HH:mm', { locale: id })}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEvent} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Judul event" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Deskripsi (opsional)" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mulai</Label>
                <Input type="datetime-local" value={eventStartDateTime} onChange={(e) => setEventStartDateTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Selesai</Label>
                <Input type="datetime-local" value={eventEndDateTime} onChange={(e) => setEventEndDateTime(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={eventType} onValueChange={(v: EventType) => setEventType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proyek (Opsional)</Label>
                <Select value={eventProjectId || "none"} onValueChange={(v) => setEventProjectId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih proyek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {data.projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>Batal</Button>
              <Button type="submit">Tambah</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
