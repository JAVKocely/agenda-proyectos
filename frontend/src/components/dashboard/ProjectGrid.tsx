import React from 'react';
import { Sparkles, Plus, FolderKanban } from 'lucide-react';
import type { ProjectSummary } from '../../types/project';
import { ProjectCard } from './ProjectCard';
import { Button } from '../ui/Button';

interface ProjectGridProps {
  projects: ProjectSummary[];
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onOpenAiModal: () => void;
  onOpenManualModal: () => void;
  isFiltered: boolean;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onSelectProject,
  onDeleteProject,
  onOpenAiModal,
  onOpenManualModal,
  isFiltered,
}) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center mb-4">
          <FolderKanban className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">
          {isFiltered ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          {isFiltered
            ? 'Prueba a cambiar los filtros o el término de búsqueda para ver más resultados.'
            : 'Comienza escribiendo tus ideas en el modal de IA o crea un proyecto manualmente.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ai"
            size="md"
            onClick={onOpenAiModal}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Organizar Proyecto con IA
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onOpenManualModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Crear Manual
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={onSelectProject}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
};
