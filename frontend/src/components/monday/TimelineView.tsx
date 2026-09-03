import React from 'react';
import { Calendar } from 'lucide-react';
import type { Task } from '../../types/project';
import { STATUS_OPTIONS } from './StatusCell';
import { formatDate } from '../../utils/dateUtils';

interface TimelineViewProps {
  tasks: Task[];
  estimatedDays?: number | null;
  targetDate?: string | null;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  estimatedDays = 14,
  targetDate,
}) => {
  const totalDays = estimatedDays || 14;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Cronograma Visual del Proyecto (Timeline)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Visualización secuencial de las tareas a lo largo del tiempo estimado ({totalDays} días)
            {targetDate && ` • Meta de entrega: ${formatDate(targetDate)}`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const statusConfig = STATUS_OPTIONS[task.status] || STATUS_OPTIONS.pending;
          // Calcular posición y ancho proporcional en el cronograma
          const taskSpan = Math.max(15, Math.min(85, Math.round((1 / (tasks.length || 1)) * 100)));
          const startOffset = Math.min(80, Math.round((index / (tasks.length || 1)) * 80));

          return (
            <div
              key={task.id}
              className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-200">
                  #{task.order} {task.title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${statusConfig.bg} ${statusConfig.textColor}`}
                >
                  {statusConfig.label}
                </span>
              </div>

              {/* Barra de Tiempo estilo Gantt de Monday */}
              <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all ${statusConfig.bg}`}
                  style={{
                    marginLeft: `${startOffset}%`,
                    width: `${taskSpan}%`,
                  }}
                  title={`Día aprox ${Math.round((startOffset / 100) * totalDays)}`}
                />
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            No hay tareas en el cronograma aún.
          </div>
        )}
      </div>
    </div>
  );
};
