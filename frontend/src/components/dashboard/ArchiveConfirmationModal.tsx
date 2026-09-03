import React from 'react';
import { Archive, CheckCircle2, Sparkles, Database, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { ProjectDetail } from '../../types/project';

interface ArchiveConfirmationModalProps {
  isOpen: boolean;
  project: ProjectDetail | null;
  onClose: () => void;
  onConfirmArchive: (projectId: string) => Promise<void>;
}

export const ArchiveConfirmationModal: React.FC<ArchiveConfirmationModalProps> = ({
  isOpen,
  project,
  onClose,
  onConfirmArchive,
}) => {
  const [isArchiving, setIsArchiving] = React.useState(false);

  if (!project) return null;

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      await onConfirmArchive(project.id);
      onClose();
    } catch (err) {
      console.error('Error al archivar proyecto:', err);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¡Todas las tareas están listas! 🎉"
      subtitle="¿Todo está listo para pasar este proyecto a Archivo Histórico?"
      maxWidth="lg"
      accent="indigo"
    >
      <div className="space-y-5">
        {/* Banner de felicitación y objetivo cumplido */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-500/30 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-sm">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>¡Objetivo 100% Cumplido!</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Has chequeado con éxito todas las casillas de este proyecto. Tu flujo de trabajo se encuentra completado.
            </p>
          </div>
        </div>

        {/* Tarjeta resumen del proyecto */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Proyecto a Archivar
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {project.tasks.length} / {project.tasks.length} Tareas Listas
            </span>
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {project.title}
          </p>
          {project.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Explicación de la base de datos y consultas posteriores */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-700 dark:text-slate-300">
          <Database className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Preservación total:</strong> El proyecto no se borra. Se archivará en la base de datos y estará siempre disponible en la pestaña <strong>"Archivo Histórico"</strong> para consultas posteriores, auditoría o para restaurarlo al tablero en cualquier momento.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isArchiving}
          >
            Mantener en Tablero Activo
          </Button>

          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving}
            className="btn-proyecto h-10 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>{isArchiving ? 'Archivando...' : 'Sí, Pasar a Archivo'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
