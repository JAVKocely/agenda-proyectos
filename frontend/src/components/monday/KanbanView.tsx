import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, TaskCreatePayload } from '../../types/project';
import { PriorityCell } from './PriorityCell';

interface KanbanViewProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, payload: { status?: TaskStatus; priority?: TaskPriority }) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (payload: TaskCreatePayload) => void;
}

const COLUMNS: { id: TaskStatus; label: string; headerBg: string }[] = [
  { id: 'pending', label: 'Pendiente', headerBg: 'bg-[#579bfc]' },
  { id: 'in_progress', label: 'En proceso', headerBg: 'bg-[#fdab3d]' },
  { id: 'stuck', label: 'Estancado', headerBg: 'bg-[#e2445c]' },
  { id: 'completed', label: 'Listo', headerBg: 'bg-[#00c875]' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
}) => {
  const [inlineTitles, setInlineTitles] = useState<Record<string, string>>({});

  const handleAddKanbanTask = (status: TaskStatus) => {
    const title = (inlineTitles[status] || '').trim();
    if (!title) return;

    onAddTask({
      title,
      status,
      priority: 'medium',
      group_name: 'Fase Principal',
    });

    setInlineTitles((prev) => ({ ...prev, [status]: '' }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start pb-12">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          >
            {/* Header de la Columna estilo Monday */}
            <div
              className={`${col.headerBg} px-4 py-2.5 text-white font-bold text-xs flex items-center justify-between shadow-sm`}
            >
              <span>{col.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold">
                {colTasks.length}
              </span>
            </div>

            {/* Lista de Tarjetas */}
            <div className="p-3 flex flex-col gap-3 min-h-[350px] max-h-[70vh] overflow-y-auto">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className="group bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3.5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {task.group_name || 'Fase Principal'}
                    </span>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity p-1"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-100 mb-3 leading-relaxed">
                    {task.title}
                  </h4>

                  {/* Prioridad y Mover */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div className="w-24">
                      <PriorityCell
                        priority={task.priority}
                        onChange={(p) => onUpdateTask(task.id, { priority: p })}
                      />
                    </div>

                    {/* Mover rápido a otra columna */}
                    <div className="flex items-center gap-1">
                      {COLUMNS.filter((c) => c.id !== col.id).map((targetCol) => (
                        <button
                          key={targetCol.id}
                          onClick={() => onUpdateTask(task.id, { status: targetCol.id })}
                          className={`w-4 h-4 rounded-full ${targetCol.headerBg} opacity-60 hover:opacity-100 transition-all hover:scale-125 cursor-pointer`}
                          title={`Mover a ${targetCol.label}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {colTasks.length === 0 && (
                <div className="flex-1 flex items-center justify-center py-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                  Sin tareas en este estado
                </div>
              )}
            </div>

            {/* Input rápido al pie de la columna */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={inlineTitles[col.id] || ''}
                  onChange={(e) =>
                    setInlineTitles((prev) => ({
                      ...prev,
                      [col.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddKanbanTask(col.id);
                  }}
                  placeholder="+ Añadir tarea..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
