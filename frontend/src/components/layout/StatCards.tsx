import React from 'react';
import { Layers, Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import type { ProjectSummary } from '../../types/project';

interface StatCardsProps {
  projects: ProjectSummary[];
}

export const StatCards: React.FC<StatCardsProps> = ({ projects }) => {
  const total = projects.length;
  const active = projects.filter((p) => p.status === 'active').length;
  const completed = projects.filter((p) => p.status === 'completed').length;

  const totalTasks = projects.reduce((acc, p) => acc + p.total_tasks, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.completed_tasks, 0);
  const avgProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: 'Total Proyectos',
      value: total,
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'En Ejecución',
      value: active,
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Completados',
      value: completed,
      icon: CheckCircle2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Avance Global',
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm flex items-center gap-3.5 backdrop-blur-sm"
          >
            <div className={`p-2.5 rounded-lg border ${item.bg}`}>
              <Icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">{item.label}</p>
              <p className="text-xl font-bold text-white tracking-tight">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
