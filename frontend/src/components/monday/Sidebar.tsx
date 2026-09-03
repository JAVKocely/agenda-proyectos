import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Sparkles,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
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
  currentUser: 'meli' | 'jhon';
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenAiModal,
  onOpenManualModal,
  isCollapsed,
  onToggleCollapse,
  currentUser,
  onLogout,
}) => {
  const [filterText, setFilterText] = useState('');
  const isMeli = currentUser === 'meli';

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

      {/* Espacio de Trabajo Selector Personalizado */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800/60">
          <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 truncate">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isMeli ? 'bg-fuchsia-500 shadow-sm shadow-fuchsia-500/50' : 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                }`}
              />
              <span className="truncate font-bold">Consola de {isMeli ? 'Meli' : 'Jhon'}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {currentUser}
            </span>
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
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Buscar tableros..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Lista de Tableros / Proyectos */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!isCollapsed && (
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Mis Tableros</span>
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
            Sin proyectos en la consola de {isMeli ? 'Meli' : 'Jhon'}. ¡Crea uno nuevo!
          </div>
        )}
      </div>

      {/* Footer del Sidebar con Cambiar Usuario */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <button
            onClick={onLogout}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cambiar de Usuario</span>
          </button>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>mml.solutions</span>
            <span className="text-emerald-400 font-semibold text-[10px]">Neon DB Online</span>
          </div>
        </div>
      )}
    </aside>
  );
};
