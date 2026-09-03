import React, { useState, useRef, useEffect } from 'react';
import type { TaskPriority } from '../../types/project';

interface PriorityCellProps {
  priority: TaskPriority;
  onChange: (newPriority: TaskPriority) => void;
  disabled?: boolean;
}

interface PriorityOption {
  id: TaskPriority;
  label: string;
  bg: string;
  hoverBg: string;
  textColor: string;
}

export const PRIORITY_OPTIONS: Record<TaskPriority, PriorityOption> = {
  urgent: {
    id: 'urgent',
    label: 'Crítica',
    bg: 'bg-[#a25ddc]',
    hoverBg: 'hover:bg-[#8f4fc5]',
    textColor: 'text-white',
  },
  high: {
    id: 'high',
    label: 'Alta',
    bg: 'bg-[#e2445c]',
    hoverBg: 'hover:bg-[#cc3d53]',
    textColor: 'text-white',
  },
  medium: {
    id: 'medium',
    label: 'Media',
    bg: 'bg-[#579bfc]',
    hoverBg: 'hover:bg-[#4a85d9]',
    textColor: 'text-white',
  },
  low: {
    id: 'low',
    label: 'Baja',
    bg: 'bg-[#788292]',
    hoverBg: 'hover:bg-[#687180]',
    textColor: 'text-white',
  },
};

export const PriorityCell: React.FC<PriorityCellProps> = ({
  priority,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = PRIORITY_OPTIONS[priority] || PRIORITY_OPTIONS.medium;

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
        className={`w-full py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all shadow-sm flex items-center justify-center cursor-pointer select-none ${current.bg} ${current.hoverBg} ${current.textColor}`}
        title="Cambiar prioridad"
      >
        <span>{current.label}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1.5 w-32 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {(Object.values(PRIORITY_OPTIONS) as PriorityOption[]).map((opt) => (
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
