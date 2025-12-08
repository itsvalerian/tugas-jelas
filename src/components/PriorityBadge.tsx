import React from 'react';
import { Priority, PRIORITY_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  showLabel?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showLabel = true, className }) => {
  const Icon = priority === 'high' ? ArrowUp : priority === 'medium' ? ArrowRight : ArrowDown;
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium',
        {
          'priority-low': priority === 'low',
          'priority-medium': priority === 'medium',
          'priority-high': priority === 'high',
        },
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {showLabel && PRIORITY_LABELS[priority]}
    </span>
  );
};
