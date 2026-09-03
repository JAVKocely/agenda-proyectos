import React from 'react';
import type { ProjectStatus, TaskPriority } from '../../types/project';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  const config: Record<ProjectStatus, { bg: string; label: string; dot: string }> = {
    active: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      label: 'Activo',
    },
    paused: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      label: 'Pausado',
    },
    completed: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      dot: 'bg-blue-400',
      label: 'Completado',
    },
    archived: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      label: 'Archivado',
    },
  };

  const item = config[status] || config.active;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${item.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-pulse`} />
      {item.label}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config: Record<TaskPriority, { bg: string; label: string }> = {
    low: {
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
      label: 'Baja',
    },
    medium: {
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      label: 'Media',
    },
    high: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      label: 'Alta',
    },
    urgent: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      label: 'Urgente',
    },
  };

  const item = config[priority] || config.medium;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border ${item.bg}`}
    >
      {item.label}
    </span>
  );
};
