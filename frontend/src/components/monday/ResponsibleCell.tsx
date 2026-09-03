import React, { useState, useRef, useEffect } from 'react';
import { User, Check, X, UserMinus } from 'lucide-react';
import type { UserProfile } from '../../types/project';

interface ResponsibleCellProps {
  assignedTo?: string | null;
  users: UserProfile[];
  onChange: (userId: string | null) => void;
  disabled?: boolean;
}

const COLOR_GRADIENTS: Record<string, string> = {
  fuchsia: 'bg-gradient-to-tr from-fuchsia-500 to-rose-500',
  cyan: 'bg-gradient-to-tr from-cyan-500 to-indigo-500',
  emerald: 'bg-gradient-to-tr from-emerald-500 to-teal-400',
  amber: 'bg-gradient-to-tr from-amber-500 to-orange-500',
  violet: 'bg-gradient-to-tr from-violet-600 to-purple-500',
  rose: 'bg-gradient-to-tr from-rose-500 to-pink-500',
};

export const getUserGradient = (user?: UserProfile | null): string => {
  if (!user) return 'bg-gradient-to-tr from-slate-500 to-slate-600';
  if (user.color && COLOR_GRADIENTS[user.color]) {
    return COLOR_GRADIENTS[user.color];
  }
  if (user.id.toLowerCase() === 'meli') {
    return 'bg-gradient-to-tr from-fuchsia-500 to-rose-500';
  }
  if (user.id.toLowerCase() === 'jhon') {
    return 'bg-gradient-to-tr from-indigo-500 via-cyan-500 to-teal-400';
  }
  return 'bg-gradient-to-tr from-indigo-600 to-cyan-500';
};

export const ResponsibleCell: React.FC<ResponsibleCellProps> = ({
  assignedTo,
  users,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const assignedUser = users.find(
    (u) => u.id.toLowerCase() === (assignedTo || '').toLowerCase()
  );

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (userId: string | null) => {
    onChange(userId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center justify-center" ref={containerRef}>
      {/* Botón trigger / avatar */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="group/btn relative flex items-center justify-center p-0.5 rounded-full transition-transform hover:scale-105 cursor-pointer disabled:cursor-not-allowed focus:outline-none"
        title={assignedUser ? `Responsable: ${assignedUser.name}` : 'Asignar responsable'}
      >
        {assignedUser ? (
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shadow-sm border border-white/20 ${getUserGradient(
              assignedUser
            )}`}
          >
            {(assignedUser.name.charAt(0) || 'U').toUpperCase()}
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full border border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all">
            <User className="w-3.5 h-3.5" />
          </div>
        )}
      </button>

      {/* Menú Desplegable de Miembros Registrados */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Responsable
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {/* Opción: Sin asignar */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                !assignedUser
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center text-slate-400">
                  <UserMinus className="w-3 h-3" />
                </div>
                <span>Sin asignar</span>
              </div>
              {!assignedUser && <Check className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Miembros Registrados en la Base de Datos */}
            {users.map((user) => {
              const isCurrent = assignedUser?.id === user.id;
              const grad = getUserGradient(user);
              const initial = (user.name.charAt(0) || 'U').toUpperCase();

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${grad}`}
                    >
                      {initial}
                    </div>
                    <span className="truncate max-w-[120px]">{user.name}</span>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
