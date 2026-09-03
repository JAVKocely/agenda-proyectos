import React from 'react';
import { Sparkles, Plus, FolderKanban } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenAiModal: () => void;
  onOpenManualModal: () => void;
  onBackToDashboard?: () => void;
  isDetailView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAiModal,
  onOpenManualModal,
  onBackToDashboard,
  isDetailView = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo y Título */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onBackToDashboard}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                Agenda IA
              </span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Proyectos
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Seguimiento Inteligente & Desglose con Structured Outputs
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2.5">
          {isDetailView && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBackToDashboard}
              className="text-xs sm:text-sm"
            >
              ← Volver al Dashboard
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenManualModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="hidden sm:inline-flex text-xs sm:text-sm"
          >
            Manual
          </Button>

          <Button
            variant="ai"
            size="sm"
            onClick={onOpenAiModal}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="text-xs sm:text-sm font-semibold shadow-indigo-500/20"
          >
            Crear con IA
          </Button>
        </div>
      </div>
    </header>
  );
};
