import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Sparkles,
  ChevronDown,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import type { ProjectSummary } from '../../types/project';

interface SidebarProps {
  projects: ProjectSummary[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onOpenAiModal: () => void;
  onOpenManualModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenAiModal,
  onOpenManualModal,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [filterText, setFilterText] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header del Sidebar */}
      <div className="h-14 border-b border-slate-800/80 px-3.5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <FolderKanban className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold text-white tracking-tight">mml.solutions</span>
              <span className="block text-[10px] text-slate-400 font-medium">Work OS</span>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors mx-auto cursor-pointer"
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Espacio de Trabajo Selector */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800/60">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2 truncate">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="truncate">Espacio Principal</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Botones de Creación Rápida */}
          <div className="grid grid-cols-2 gap-1.5 mt-2.5">
            <button
              onClick={onOpenAiModal}
              className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Con IA</span>
            </button>
            <button
              onClick={onOpenManualModal}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-800 flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Manual</span>
            </button>
          </div>

          {/* Buscador de Tableros */}
          <div className="relative mt-2.5">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Buscar tableros..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Lista de Tableros / Proyectos */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!isCollapsed && (
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Tableros</span>
            <span className="text-slate-400">{projects.length}</span>
          </div>
        )}

        {filteredProjects.map((proj) => {
          const isSelected = selectedProjectId === proj.id;

          return (
            <button
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title={proj.title}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  proj.status === 'completed'
                    ? 'bg-[#00c875]'
                    : proj.status === 'paused'
                    ? 'bg-[#fdab3d]'
                    : 'bg-[#579bfc]'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="truncate">{proj.title}</p>
                  <p className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {proj.completed_tasks}/{proj.total_tasks} ({proj.progress_percentage}%)
                  </p>
                </div>
              )}
            </button>
          );
        })}

        {projects.length === 0 && !isCollapsed && (
          <div className="text-center py-6 px-2 text-slate-400 text-xs">
            Sin proyectos aún. ¡Crea el primero con IA!
          </div>
        )}
      </div>

      {/* Footer del Sidebar */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>mml.solutions © 2026</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
            Online
          </span>
        </div>
      )}
    </aside>
  );
};
