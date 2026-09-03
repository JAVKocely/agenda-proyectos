import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCreatePayload,
} from '../../types/project';
import { StatusCell } from './StatusCell';
import { PriorityCell } from './PriorityCell';
import { formatDate } from '../../utils/dateUtils';

interface MainTableProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, payload: { status?: TaskStatus; priority?: TaskPriority; title?: string }) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (payload: TaskCreatePayload) => void;
}

const GROUP_COLORS = [
  '#0073ea', // Monday classic blue
  '#a25ddc', // Purple
  '#00c875', // Emerald
  '#fdab3d', // Orange
  '#e2445c', // Rose
  '#579bfc', // Sky
];

export const MainTable: React.FC<MainTableProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
}) => {
  // Estado para grupos colapsados
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  // Inputs para añadir tarea inline en cada grupo
  const [newRowTitles, setNewRowTitles] = useState<Record<string, string>>({});
  // Título en edición inline
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  // Agrupar tareas por group_name
  const groups = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      const g = t.group_name && t.group_name.trim() ? t.group_name.trim() : 'Fase Principal';
      if (!map[g]) map[g] = [];
      map[g].push(t);
    });

    if (Object.keys(map).length === 0) {
      map['Fase 1: Preparación y Estrategia'] = [];
    }

    return Object.entries(map).map(([name, groupTasks], idx) => ({
      name,
      tasks: groupTasks.sort((a, b) => a.order - b.order),
      color: GROUP_COLORS[idx % GROUP_COLORS.length],
    }));
  }, [tasks]);

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const handleCreateInlineTask = (groupName: string) => {
    const title = (newRowTitles[groupName] || '').trim();
    if (!title) return;

    onAddTask({
      title,
      group_name: groupName,
      status: 'pending',
      priority: 'medium',
    });

    setNewRowTitles((prev) => ({ ...prev, [groupName]: '' }));
  };

  const startEditTitle = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const saveEditTitle = (taskId: string) => {
    if (editingTitle.trim()) {
      onUpdateTask(taskId, { title: editingTitle.trim() });
    }
    setEditingTaskId(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {groups.map((group) => {
        const isCollapsed = !!collapsedGroups[group.name];

        // Estadísticas para la barra de progreso segmentada de Monday
        const total = group.tasks.length;
        const doneCount = group.tasks.filter((t) => t.status === 'completed').length;
        const workingCount = group.tasks.filter((t) => t.status === 'in_progress').length;
        const stuckCount = group.tasks.filter((t) => t.status === 'stuck').length;
        const pendingCount = group.tasks.filter((t) => t.status === 'pending').length;

        const donePct = total > 0 ? (doneCount / total) * 100 : 0;
        const workingPct = total > 0 ? (workingCount / total) * 100 : 0;
        const stuckPct = total > 0 ? (stuckCount / total) * 100 : 0;
        const pendingPct = total > 0 ? (pendingCount / total) * 100 : 0;

        return (
          <div
            key={group.name}
            className="bg-slate-900/60 border border-slate-800/90 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Header del Grupo estilo Monday */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => toggleGroupCollapse(group.name)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />

                <h3
                  className="text-sm font-bold tracking-tight"
                  style={{ color: group.color }}
                >
                  {group.name}
                </h3>

                <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-800">
                  {group.tasks.length} elementos
                </span>
              </div>
            </div>

            {/* Contenido de la Tabla */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                      <th className="w-10 px-3 py-2 text-center">#</th>
                      <th className="px-4 py-2 min-w-[280px]">Elemento / Tarea</th>
                      <th className="w-28 px-3 py-2 text-center">Responsable</th>
                      <th className="w-36 px-3 py-2 text-center">Estado</th>
                      <th className="w-32 px-3 py-2 text-center">Prioridad</th>
                      <th className="w-32 px-3 py-2 text-center">Fecha Límite</th>
                      <th className="w-12 px-2 py-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-xs">
                    {group.tasks.map((task, rowIdx) => {
                      const isEditing = editingTaskId === task.id;

                      return (
                        <tr
                          key={task.id}
                          className="group/row hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Borde de color de grupo e índice */}
                          <td
                            className="px-3 py-2.5 text-center text-slate-400 font-mono text-[11px] relative"
                            style={{ borderLeft: `4px solid ${group.color}` }}
                          >
                            {rowIdx + 1}
                          </td>

                          {/* Título de la tarea con edición inline */}
                          <td className="px-4 py-2.5 font-medium text-slate-200">
                            {isEditing ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={() => saveEditTitle(task.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditTitle(task.id);
                                  if (e.key === 'Escape') setEditingTaskId(null);
                                }}
                                className="w-full bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none"
                              />
                            ) : (
                              <div
                                onClick={() => startEditTitle(task)}
                                className={`cursor-pointer hover:text-white transition-colors truncate max-w-md ${
                                  task.status === 'completed'
                                    ? 'line-through text-slate-400'
                                    : ''
                                }`}
                                title="Haz clic para editar"
                              >
                                {task.title}
                              </div>
                            )}
                          </td>

                          {/* Avatar / Persona asignada */}
                          <td className="px-3 py-2.5 text-center">
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          </td>

                          {/* Celda de Estado tipo Monday */}
                          <td className="px-3 py-2.5 text-center">
                            <StatusCell
                              status={task.status}
                              onChange={(newStatus) =>
                                onUpdateTask(task.id, { status: newStatus })
                              }
                            />
                          </td>

                          {/* Celda de Prioridad tipo Monday */}
                          <td className="px-3 py-2.5 text-center">
                            <PriorityCell
                              priority={task.priority}
                              onChange={(newPriority) =>
                                onUpdateTask(task.id, { priority: newPriority })
                              }
                            />
                          </td>

                          {/* Fecha */}
                          <td className="px-3 py-2.5 text-center text-slate-400 text-[11px] whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatDate(task.due_date)}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="px-2 py-2.5 text-center">
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="opacity-0 group-hover/row:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                              title="Eliminar fila"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Fila Inline de "+ Añadir elemento" en 1 clic */}
                    <tr className="bg-slate-950/20 hover:bg-slate-950/40">
                      <td
                        className="px-3 py-2 text-center text-slate-400"
                        style={{ borderLeft: `4px solid ${group.color}` }}
                      >
                        <Plus className="w-3.5 h-3.5 mx-auto text-slate-400" />
                      </td>
                      <td colSpan={6} className="px-4 py-2">
                        <input
                          type="text"
                          value={newRowTitles[group.name] || ''}
                          onChange={(e) =>
                            setNewRowTitles((prev) => ({
                              ...prev,
                              [group.name]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateInlineTask(group.name);
                          }}
                          placeholder="+ Añadir elemento (escribe y presiona Enter)..."
                          className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-400"
                        />
                      </td>
                    </tr>
                  </tbody>

                  {/* Resumen del Grupo: Barra Multi-Segmento estilo Monday */}
                  <tfoot>
                    <tr className="bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400">
                      <td
                        className="px-3 py-2 text-center font-bold text-slate-300"
                        style={{ borderLeft: `4px solid ${group.color}` }}
                      >
                        Σ
                      </td>
                      <td className="px-4 py-2 font-medium">
                        {total} elementos ({doneCount} completados - {Math.round(donePct)}%)
                      </td>
                      <td></td>
                      {/* Barra de progreso multicolor de Monday */}
                      <td className="px-3 py-2">
                        <div className="w-full h-3 rounded-full overflow-hidden bg-slate-800 flex shadow-inner">
                          {donePct > 0 && (
                            <div
                              style={{ width: `${donePct}%` }}
                              className="h-full bg-[#00c875] transition-all"
                              title={`Listo: ${doneCount} (${Math.round(donePct)}%)`}
                            />
                          )}
                          {workingPct > 0 && (
                            <div
                              style={{ width: `${workingPct}%` }}
                              className="h-full bg-[#fdab3d] transition-all"
                              title={`En proceso: ${workingCount}`}
                            />
                          )}
                          {stuckPct > 0 && (
                            <div
                              style={{ width: `${stuckPct}%` }}
                              className="h-full bg-[#e2445c] transition-all"
                              title={`Estancado: ${stuckCount}`}
                            />
                          )}
                          {pendingPct > 0 && (
                            <div
                              style={{ width: `${pendingPct}%` }}
                              className="h-full bg-[#579bfc] transition-all"
                              title={`Pendiente: ${pendingCount}`}
                            />
                          )}
                        </div>
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
