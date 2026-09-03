import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Archive,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';
import type { ProjectSummary } from '../../types/project';

export const isTaskItem = (item?: { title: string; description?: string | null } | null): boolean => {
  if (!item) return false;
  const title = (item.title || '').toLowerCase();
  if (title.includes('tablero') || title.includes('tarea')) return true;
  const desc = (item.description || '').toLowerCase();
  if (desc.includes('espacio de trabajo general') || desc.includes('tarea')) return true;
  return false;
};

interface SidebarProps {
  projects: ProjectSummary[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onOpenAiModal: () => void;
  onOpenManualModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: string;
  onLogout: () => void;
  filterType?: 'all' | 'projects' | 'tasks';
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
  filterType = 'all',
}) => {
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const isMeli = currentUser === 'meli';

  const activeProjects = projects.filter((p) => p.status !== 'archived');
  const archivedProjects = projects.filter((p) => p.status === 'archived');

  const currentList = activeTab === 'active' ? activeProjects : archivedProjects;
  const filteredProjects = currentList.filter((p) => {
    const matchesText = p.title.toLowerCase().includes(filterText.toLowerCase());
    if (!matchesText) return false;
    if (filterType === 'tasks') return isTaskItem(p);
    if (filterType === 'projects') return !isTaskItem(p);
    return true;
  });

  return (
    <aside
      className={`h-screen sticky top-0 flex-shrink-0 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header del Sidebar */}
      <div className="h-14 border-b border-slate-800/80 px-3.5 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="MML Enterprises Logo"
              className="w-8 h-8 object-contain rounded-lg p-0.5 bg-slate-900/90 border border-slate-800 shadow-sm"
            />
            <div className="leading-tight">
              <span className="text-xs font-bold text-white tracking-tight">MML ENTERPRISES</span>
              <span className="block text-[10px] text-amber-400 font-medium">Work OS</span>
            </div>
          </div>
        ) : (
          <img
            src="/logo.png"
            alt="MML"
            className="w-7 h-7 object-contain rounded-lg p-0.5 bg-slate-900 border border-slate-800"
          />
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
              <span className="truncate font-bold">Consola de {currentUser.toUpperCase()}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {currentUser}
            </span>
          </div>

          {/* Botones de Creación Rápida con Sombras Diferenciadas */}
          <div className="grid grid-cols-2 gap-1.5 mt-2.5">
            <button
              onClick={onOpenAiModal}
              className="btn-proyecto h-9 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 border border-transparent transition-all cursor-pointer leading-none"
              title="Crear un Proyecto / Tablero completo con IA"
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="leading-none">Proyecto</span>
            </button>
            <button
              onClick={onOpenManualModal}
              className="btn-tarea h-9 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white border border-transparent flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs sm:text-[13px] font-bold shadow-md shadow-cyan-500/30 hover:shadow-cyan-500/50 leading-none"
              title="Crear una Tarea manual puntual"
            >
              <Plus className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
              <span className="leading-none">Tarea</span>
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

      {/* Pestañas de Tableros Activos vs Archivo */}
      {!isCollapsed && (
        <div className="px-3 pt-2 pb-1">
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderKanban className="w-3 h-3" />
              <span>Activos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {activeProjects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'archived'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Archive className="w-3 h-3" />
              <span>Archivo</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {archivedProjects.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de Tableros / Proyectos */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!isCollapsed && (
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{activeTab === 'active' ? 'Tableros Activos' : 'Archivo Histórico'}</span>
            <span className="text-slate-400">{filteredProjects.length}</span>
          </div>
        )}

        {filteredProjects.map((proj) => {
          const isSelected = selectedProjectId === proj.id;
          const isArchived = proj.status === 'archived';
          const isTask = isTaskItem(proj);

          // Clases de estilo según tipo: Tarea (cyan) vs Proyecto (morado/índigo)
          let itemStyle = 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent';
          if (isSelected) {
            if (isArchived) {
              itemStyle = 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-400/40';
            } else if (isTask) {
              // Color de TAREA: Cyan / Turquesa
              itemStyle =
                'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/30 border border-cyan-400/50';
            } else {
              // Color de PROYECTO: Morado / Violeta / Índigo
              itemStyle =
                'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/50';
            }
          }

          return (
            <button
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${itemStyle}`}
              title={proj.title}
            >
              {isArchived ? (
                <Archive className="w-3.5 h-3.5 flex-shrink-0 text-amber-300" />
              ) : isTask ? (
                <CheckSquare
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    isSelected ? 'text-cyan-100' : 'text-cyan-400'
                  }`}
                />
              ) : (
                <FolderKanban
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    isSelected ? 'text-indigo-100' : 'text-indigo-400'
                  }`}
                />
              )}

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-xs leading-tight mb-0.5">{proj.title}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={isSelected ? 'text-white/90 font-medium' : 'text-slate-400'}>
                      {proj.completed_tasks}/{proj.total_tasks} ({proj.progress_percentage}%)
                    </span>
                    <span
                      className={`text-[8.5px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                        isSelected
                          ? 'bg-black/25 text-white'
                          : isTask
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isTask ? 'Tarea' : 'Proyecto'}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}

        {filteredProjects.length === 0 && !isCollapsed && (
          <div className="text-center py-6 px-2 text-slate-400 text-xs">
            {activeTab === 'active'
              ? 'No hay proyectos activos. ¡Crea uno nuevo con el botón de Proyecto o IA!'
              : 'El archivo histórico está vacío. Cuando completes el 100% de un proyecto podrás archivarlo aquí.'}
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
