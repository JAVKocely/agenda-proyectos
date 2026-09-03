import React from 'react';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress * 10) / 10));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  // Color de barra dinámico según el porcentaje
  const getGradientColor = () => {
    if (clampedProgress === 100) return 'from-emerald-500 to-teal-400';
    if (clampedProgress >= 70) return 'from-indigo-500 to-emerald-400';
    if (clampedProgress >= 35) return 'from-blue-600 to-indigo-500';
    return 'from-violet-600 to-blue-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium">
          <span className="text-slate-400">Progreso</span>
          <span
            className={
              clampedProgress === 100
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-200'
            }
          >
            {clampedProgress}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${heightClasses} ring-1 ring-white/5`}>
        <div
          className={`h-full bg-gradient-to-r ${getGradientColor()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
