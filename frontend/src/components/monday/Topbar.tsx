import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  Kanban,
  Calendar,
  Search,
  Star,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';
import type { ProjectDetail } from '../../types/project';

export type ActiveView = 'table' | 'kanban' | 'timeline';

interface TopbarProps {
  project: ProjectDetail | null;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  searchFilter: string;
  onSearchChange: (val: string) => void;
  filterType: 'all' | 'projects' | 'tasks';
  onFilterTypeChange: (type: 'all' | 'projects' | 'tasks') => void;
  currentUser: string;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  project,
  activeView,
  onViewChange,
  searchFilter,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  currentUser,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const userInitial = (currentUser.charAt(0) || 'U').toUpperCase();
  const isMeli = currentUser.toLowerCase() === 'meli';
  const avatarGradient = isMeli
    ? 'bg-gradient-to-tr from-fuchsia-500 to-rose-500'
    : 'bg-gradient-to-tr from-indigo-500 via-cyan-500 to-teal-400';

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <div className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-20 px-6 pt-4 pb-0">
      {/* Título y Acciones Principales */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {project ? project.title : 'Selecciona un Tablero'}
          </h1>
          {project && (
            <button
              className="text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
              title="Favorito"
            >
              <Star className="w-4 h-4" />
            </button>
          )}

          {/* Dos Botones Alargados Pequeños para Filtrar Proyectos y Tareas */}
          <div className="flex items-center gap-2 ml-1 sm:ml-3">
            {/* Botón Proyectos (Violeta / Índigo) */}
            <button
              type="button"
              onClick={() =>
                onFilterTypeChange(filterType === 'projects' ? 'all' : 'projects')
              }
              className={`h-7 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                filterType === 'projects'
                  ? 'btn-proyecto bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-indigo-400/60 shadow-md shadow-indigo-500/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-indigo-500/50 hover:text-indigo-300'
              }`}
              title={
                filterType === 'projects'
                  ? 'Filtro de proyectos activo (clic para ver todo)'
                  : 'Filtrar y enfocar proyectos'
              }
            >
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              <span>Proyectos</span>
            </button>

            {/* Botón Tareas (Cyan / Turquesa) */}
            <button
              type="button"
              onClick={() =>
                onFilterTypeChange(filterType === 'tasks' ? 'all' : 'tasks')
              }
              className={`h-7 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                filterType === 'tasks'
                  ? 'btn-tarea bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-cyan-400/60 shadow-md shadow-cyan-500/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-cyan-500/50 hover:text-cyan-300'
              }`}
              title={
                filterType === 'tasks'
                  ? 'Filtro de tareas activo (clic para ver todo)'
                  : 'Filtrar y enfocar tareas'
              }
            >
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tareas</span>
              {project && project.tasks.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filterType === 'tasks'
                      ? 'bg-cyan-950/40 text-cyan-200 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {project.tasks.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Perfil de Usuario con Menú Desplegable */}
        <div className="relative" ref={menuRef}>
          {/* Botón Badge de Usuario Activo */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm group"
            title="Abrir menú de usuario"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-transform group-hover:scale-105 ${avatarGradient}`}
            >
              {userInitial}
            </div>
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {currentUser}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isUserMenuOpen ? 'rotate-180 text-white' : 'group-hover:text-slate-200'
              }`}
            />
          </button>

          {/* Menú Desplegable al presionar el nombre */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 text-left animate-in fade-in slide-in-from-top-2">
              {/* Header de Información de Usuario */}
              <div className="flex items-center gap-3 p-2.5 pb-3 border-b border-slate-800/80 mb-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${avatarGradient}`}
                >
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white leading-tight uppercase tracking-wide truncate">
                    {currentUser}
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium">Consola Personal</span>
                </div>
              </div>

              {/* Submenú: Selector de Modo Oscuro a Claro */}
              <div className="p-1 mb-2">
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Apariencia
                  </span>
                  <span className="text-[10px] font-medium text-indigo-400">
                    {theme === 'dark' ? 'Oscuro activo' : 'Claro activo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl">
                  {/* Opción Oscuro */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleTheme('dark');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Oscuro</span>
                  </button>

                  {/* Opción Claro */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleTheme('light');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Claro</span>
                  </button>
                </div>
              </div>

              {/* Opción de Cambiar de Usuario */}
              <div className="pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Cambiar de Usuario / Salir</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs de Vistas estilo Monday.com */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewChange('table')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'table'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabla Principal</span>
          </button>

          <button
            onClick={() => onViewChange('kanban')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'kanban'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'timeline'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Cronograma</span>
          </button>
        </div>

        {/* Buscador Rápido del Tablero */}
        <div className="relative w-48 sm:w-60 mb-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar en el tablero..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
