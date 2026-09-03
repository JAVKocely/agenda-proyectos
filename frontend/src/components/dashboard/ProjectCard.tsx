import React from 'react';
import { CheckSquare, Clock, Trash2 } from 'lucide-react';
import type { ProjectSummary } from '../../types/project';
import { StatusBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { getDaysRemaining } from '../../utils/dateUtils';

interface ProjectCardProps {
  project: ProjectSummary;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onDelete,
}) => {
  const daysInfo = getDaysRemaining(project.target_date);

  return (
    <div
      onClick={() => onSelect(project.id)}
      className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 backdrop-blur-sm"
    >
      <div>
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <StatusBadge status={project.status} />
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => onDelete(project.id, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Eliminar proyecto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Título y Descripción */}
        <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1.5">
          {project.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
          {project.description || 'Sin descripción adicional.'}
        </p>
      </div>

      <div>
        {/* Progreso Visual en Porcentaje */}
        <div className="mb-4">
          <ProgressBar progress={project.progress_percentage} size="sm" />
        </div>

        {/* Métricas Inferiores */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          {/* Contador de Tareas */}
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong className="text-slate-200 font-semibold">{project.completed_tasks}</strong>
              /{project.total_tasks} tareas
            </span>
          </div>

          {/* Fecha Límite Calculada */}
          <div className="flex items-center gap-1.5">
            <Clock
              className={`w-3.5 h-3.5 ${
                daysInfo.isOverdue ? 'text-rose-400' : 'text-slate-400'
              }`}
            />
            <span
              className={
                daysInfo.isOverdue
                  ? 'text-rose-400 font-medium'
                  : 'text-slate-400'
              }
            >
              {daysInfo.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
