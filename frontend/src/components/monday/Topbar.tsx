import React from 'react';
import {
  Table,
  Kanban,
  Calendar,
  Search,
  Star,
  LogOut,
} from 'lucide-react';
import type { ProjectDetail } from '../../types/project';

export type ActiveView = 'table' | 'kanban' | 'timeline';

interface TopbarProps {
  project: ProjectDetail | null;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  searchFilter: string;
  onSearchChange: (val: string) => void;
  currentUser: 'meli' | 'jhon';
  onLogout: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  project,
  activeView,
  onViewChange,
  searchFilter,
  onSearchChange,
  currentUser,
  onLogout,
}) => {
  const isMeli = currentUser === 'meli';

  return (
    <div className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-20 px-6 pt-4 pb-0">
      {/* Título y Acciones Principales */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
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
        </div>

        {/* Perfil de Usuario y Acciones */}
        <div className="flex items-center gap-2.5">
          {/* Badge del Usuario Activo */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                isMeli
                  ? 'bg-gradient-to-tr from-fuchsia-500 to-rose-500'
                  : 'bg-gradient-to-tr from-indigo-500 to-cyan-500'
              }`}
            >
              {isMeli ? 'M' : 'J'}
            </div>
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {currentUser}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
            title="Cambiar de usuario"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
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
