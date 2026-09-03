import React, { useState, useRef, useEffect } from 'react';
import type { TaskStatus } from '../../types/project';

interface StatusCellProps {
  status: TaskStatus;
  onChange: (newStatus: TaskStatus) => void;
  disabled?: boolean;
}

interface StatusOption {
  id: TaskStatus;
  label: string;
  bg: string;
  hoverBg: string;
  textColor: string;
}

export const STATUS_OPTIONS: Record<TaskStatus, StatusOption> = {
  completed: {
    id: 'completed',
    label: 'Listo',
    bg: 'bg-[#00c875]',
    hoverBg: 'hover:bg-[#00b067]',
    textColor: 'text-white',
  },
  in_progress: {
    id: 'in_progress',
    label: 'En proceso',
    bg: 'bg-[#fdab3d]',
    hoverBg: 'hover:bg-[#e59b37]',
    textColor: 'text-white',
  },
  stuck: {
    id: 'stuck',
    label: 'Estancado',
    bg: 'bg-[#e2445c]',
    hoverBg: 'hover:bg-[#cc3d53]',
    textColor: 'text-white',
  },
  pending: {
    id: 'pending',
    label: 'Pendiente',
    bg: 'bg-[#579bfc]',
    hoverBg: 'hover:bg-[#4a85d9]',
    textColor: 'text-white',
  },
  archived: {
    id: 'archived',
    label: 'Archivado',
    bg: 'bg-amber-600',
    hoverBg: 'hover:bg-amber-500',
    textColor: 'text-white',
  },
};

export const StatusCell: React.FC<StatusCellProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = STATUS_OPTIONS[status] || STATUS_OPTIONS.pending;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-1.5 px-3 text-xs font-semibold rounded-md transition-all shadow-sm flex items-center justify-center cursor-pointer select-none ${current.bg} ${current.hoverBg} ${current.textColor}`}
        title="Cambiar estado"
      >
        <span>{current.label}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1.5 w-36 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {(Object.values(STATUS_OPTIONS) as StatusOption[]).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`w-full py-1.5 px-2 text-xs font-semibold rounded-lg transition-transform hover:scale-[1.02] cursor-pointer ${opt.bg} ${opt.textColor}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
