import React from 'react';
import { Check, Trash2, Clock } from 'lucide-react';
import type { Task } from '../../types/project';
import { PriorityBadge } from '../ui/Badge';
import { formatDate } from '../../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (taskId: string, currentStatus: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onDeleteTask,
}) => {
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={`group relative flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:shadow-md'
      }`}
    >
      {/* Checkbox Interactivo */}
      <button
        onClick={() => onToggleStatus(task.id, task.status)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
            : 'border-slate-600 hover:border-indigo-400 bg-slate-800/80'
        }`}
        aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
      >
        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </button>

      {/* Contenido de la Tarea */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            #{task.order}
          </span>
          <h4
            className={`text-sm font-medium transition-all ${
              isCompleted
                ? 'line-through text-slate-400'
                : 'text-slate-100 group-hover:text-indigo-200'
            }`}
          >
            {task.title}
          </h4>
          <PriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p
            className={`text-xs leading-relaxed mt-1 ${
              isCompleted ? 'text-slate-400 line-through' : 'text-slate-300'
            }`}
          >
            {task.description}
          </p>
        )}

        {task.due_date && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <Clock className="w-3 h-3" />
            <span>Vence: {formatDate(task.due_date)}</span>
          </div>
        )}
      </div>

      {/* Acción de Eliminar */}
      <button
        onClick={() => onDeleteTask(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
        title="Eliminar tarea"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
