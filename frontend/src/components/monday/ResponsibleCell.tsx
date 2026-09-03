import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Check, X, UserMinus, ChevronDown } from 'lucide-react';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const assignedUser = users.find(
    (u) => u.id.toLowerCase() === (assignedTo || '').toLowerCase()
  );

  // Calcular posición exacta en pantalla para que NUNCA se oculte bajo tablas ni bordes
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 250;
    const dropdownWidth = 224;

    // Si no cabe abajo en el viewport, abrirlo hacia arriba
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    const top = openUpward ? rect.top - dropdownHeight - 6 : rect.bottom + 6;
    let left = rect.left + rect.width / 2 - dropdownWidth / 2;

    // Mantener dentro de los márgenes horizontales de la pantalla
    left = Math.max(10, Math.min(window.innerWidth - dropdownWidth - 10, left));

    setCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Escuchar clics fuera para cerrar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
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

  // Actualizar posición al hacer scroll o redimensionar
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleScrollOrResize = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return; // Scroll dentro del dropdown
      }
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleSelect = (userId: string | null) => {
    onChange(userId);
    setIsOpen(false);
  };

  return (
    <div className="inline-flex items-center justify-center">
      {/* Píldora / Botón interactivo con Avatar Y Nombre Completo (no solo inicial) */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`group/btn relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-150 cursor-pointer disabled:cursor-not-allowed focus:outline-none select-none max-w-[160px] shadow-xs hover:scale-[1.02] ${
          assignedUser
            ? 'bg-slate-100 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
            : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 bg-slate-50/60 dark:bg-slate-900/50'
        }`}
        title={assignedUser ? `Responsable asignado: ${assignedUser.name}` : 'Asignar miembro'}
      >
        {assignedUser ? (
          <>
            {/* Avatar circular con inicial */}
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-xs flex-shrink-0 ${getUserGradient(
                assignedUser
              )}`}
            >
              {(assignedUser.name.charAt(0) || 'U').toUpperCase()}
            </div>
            {/* Nombre completo de Meli, Jhon o el usuario registrado */}
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate uppercase tracking-tight">
              {assignedUser.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover/btn:text-slate-600 dark:group-hover/btn:text-slate-300 flex-shrink-0" />
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full border border-dashed border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
              <User className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Asignar
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
          </>
        )}
      </button>

      {/* Menú Desplegable renderizado vía Portal (Completamente inmune a overflow de tablas) */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Asignar Responsable
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-0.5 p-0.5">
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

              {/* Miembros Registrados en la Base de Datos (Meli, Jhon, etc.) */}
              {users.map((user) => {
                const isCurrent = assignedUser?.id.toLowerCase() === user.id.toLowerCase();
                const grad = getUserGradient(user);
                const initial = (user.name.charAt(0) || 'U').toUpperCase();

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/70 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shadow-xs flex-shrink-0 ${grad}`}
                      >
                        {initial}
                      </div>
                      <span className="truncate font-bold uppercase">{user.name}</span>
                    </div>
                    {isCurrent && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.5] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

