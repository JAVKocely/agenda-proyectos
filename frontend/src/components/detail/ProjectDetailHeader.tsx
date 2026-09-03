import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import type { ProjectDetail, ProjectStatus } from '../../types/project';
import { StatusBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { formatDate, getDaysRemaining } from '../../utils/dateUtils';

interface ProjectDetailHeaderProps {
  project: ProjectDetail;
  onStatusChange: (newStatus: ProjectStatus) => void;
  onDeleteProject: () => void;
}

export const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  project,
  onStatusChange,
  onDeleteProject,
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const daysInfo = getDaysRemaining(project.target_date);

  const statuses: { id: ProjectStatus; label: string }[] = [
    { id: 'active', label: 'Activo' },
    { id: 'paused', label: 'Pausado' },
    { id: 'completed', label: 'Completado' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl backdrop-blur-sm">
      {/* Fila Superior: Estado y Acciones Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} size="md" />
          {project.raw_prompt && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500/15 to-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Generado con IA
            </span>
          )}
        </div>

        {/* Controles de Estado Rápido y Eliminación */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => onStatusChange(s.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  project.status === s.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={onDeleteProject}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            title="Eliminar este proyecto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Título y Descripción */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          {project.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
          {project.description || 'Sin descripción disponible.'}
        </p>
      </div>

      {/* Barra de Progreso Reactiva Principal */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 mb-6">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
          <span className="text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Avance Total del Proyecto
          </span>
          <span className="text-white font-mono text-base">
            {project.completed_tasks} / {project.total_tasks} tareas ({project.progress_percentage}%)
          </span>
        </div>
        <ProgressBar progress={project.progress_percentage} size="lg" showLabel={false} />
      </div>

      {/* Metadatos y Fechas Límite */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>
            Estimación IA: <strong className="text-slate-200">{project.estimated_completion_days || 7} días</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>
            Fecha Límite: <strong className="text-slate-200">{formatDate(project.target_date)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${
              daysInfo.isOverdue ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            ● {daysInfo.label}
          </span>
        </div>
      </div>

      {/* Entrada Original de Notas (Input Libre IA) si existe */}
      {project.raw_prompt && (
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showPrompt ? 'Ocultar notas originales de entrada' : 'Ver notas originales introducidas al Agente IA'}</span>
            {showPrompt ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showPrompt && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-indigo-500/20 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed animate-in fade-in duration-200">
              {project.raw_prompt}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
