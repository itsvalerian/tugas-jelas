import React from 'react';
import { TaskStatus, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <span
      className={cn(
        'status-badge',
        {
          'status-not-started': status === 'not_started',
          'status-todo': status === 'todo',
          'status-in-progress': status === 'in_progress',
          'status-hold': status === 'hold',
          'status-done': status === 'done',
          'status-overdue': status === 'overdue',
        },
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
};
