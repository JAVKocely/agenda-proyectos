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
  Users,
  UserPlus,
} from 'lucide-react';
import type { ProjectDetail, UserProfile } from '../../types/project';
import { getUserGradient } from './ResponsibleCell';
import { isTaskItem } from './Sidebar';

export type ActiveView = 'table' | 'kanban' | 'timeline';

interface TopbarProps {
  project: ProjectDetail | null;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  searchFilter: string;
  onSearchChange: (val: string) => void;
  filterType: 'all' | 'projects' | 'tasks';
  onFilterTypeChange: (type: 'all' | 'projects' | 'tasks') => void;
  users?: UserProfile[];
  onSwitchUser?: (userId: string) => void;
  onOpenCreateUserModal?: () => void;
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
  users = [],
  onSwitchUser,
  onOpenCreateUserModal,
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
      {/* Título y Acciones Principales - Fila Única y Estable */}
      <div className="flex items-center justify-between gap-3 mb-3 min-w-0">
        {/* Lado Izquierdo: Título con truncate + Badge + Favorito */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <h1
            className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2 min-w-0"
            title={project ? project.title : ''}
          >
            <span className="truncate">{project ? project.title : 'Selecciona un Tablero'}</span>
          </h1>
          {project && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider flex-shrink-0 ${
                isTaskItem(project)
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-xs shadow-cyan-500/20'
                  : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-xs shadow-indigo-500/20'
              }`}
            >
              {isTaskItem(project) ? 'Tarea' : 'Proyecto'}
            </span>
          )}
          {project && (
            <button
              className="text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer flex-shrink-0"
              title="Favorito"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Lado Derecho: Perfil de Usuario con Menú Desplegable (SIEMPRE a la extrema derecha) */}
        <div className="relative flex-shrink-0" ref={menuRef}>
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

              {/* Sección: Miembros Registrados en la Base de Datos */}
              <div className="p-1 mb-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-indigo-400" />
                    <span>Miembros Registrados ({users.length})</span>
                  </span>
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {users.map((u) => {
                    const isCurrent = u.id.toLowerCase() === currentUser.toLowerCase();
                    const grad = getUserGradient(u);
                    const init = (u.name.charAt(0) || 'U').toUpperCase();

                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          if (!isCurrent && onSwitchUser) {
                            onSwitchUser(u.id);
                            setIsUserMenuOpen(false);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                            : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                        }`}
                        title={isCurrent ? 'Usuario activo actualmente' : `Cambiar a consola de ${u.name}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0 ${grad}`}>
                            {init}
                          </div>
                          <span className="truncate">{u.name}</span>
                        </div>
                        {isCurrent ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 font-bold">
                            Activo
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 hover:text-indigo-400">
                            Entrar →
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Botón para Registrar Nuevo Miembro directamente */}
                {onOpenCreateUserModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenCreateUserModal();
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 border border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Registrar Nuevo Miembro</span>
                  </button>
                )}
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

        {/* Filtros compactos y Buscador */}
        <div className="flex items-center gap-2 mb-1.5 flex-shrink-0">
          {/* Botones de Filtro Proyectos / Tareas (más pequeños y menos visibles) */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-full border border-slate-800/80">
            {/* Botón Proyectos */}
            <button
              type="button"
              onClick={() =>
                onFilterTypeChange(filterType === 'projects' ? 'all' : 'projects')
              }
              className={`h-6 px-2.5 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                filterType === 'projects'
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title={
                filterType === 'projects'
                  ? 'Filtro de proyectos activo (clic para ver todo)'
                  : 'Filtrar proyectos'
              }
            >
              <FolderKanban className="w-3 h-3 text-indigo-400/80" />
              <span>Proyectos</span>
            </button>

            {/* Botón Tareas */}
            <button
              type="button"
              onClick={() =>
                onFilterTypeChange(filterType === 'tasks' ? 'all' : 'tasks')
              }
              className={`h-6 px-2.5 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                filterType === 'tasks'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title={
                filterType === 'tasks'
                  ? 'Filtro de tareas activo (clic para ver todo)'
                  : 'Filtrar tareas'
              }
            >
              <CheckSquare className="w-3 h-3 text-cyan-400/80" />
              <span>Tareas</span>
              {project && project.tasks.length > 0 && (
                <span
                  className={`text-[9.5px] px-1 rounded-full font-mono ${
                    filterType === 'tasks'
                      ? 'bg-cyan-900/60 text-cyan-200 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {project.tasks.length}
                </span>
              )}
            </button>
          </div>

          {/* Buscador Rápido del Tablero */}
          <div className="relative w-36 sm:w-48">
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
    </div>

  );
};
