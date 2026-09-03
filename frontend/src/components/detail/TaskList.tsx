import React from 'react';
import { Plus, ListTodo } from 'lucide-react';
import type { Task } from '../../types/project';
import { TaskItem } from './TaskItem';
import { Button } from '../ui/Button';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (taskId: string, currentStatus: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddTask: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleStatus,
  onDeleteTask,
  onOpenAddTask,
}) => {
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <ListTodo className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">Desglose de Tareas / Fases</h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenAddTask}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Añadir Tarea
        </Button>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400 mb-3">Este proyecto no tiene tareas asignadas aún.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenAddTask}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Crear primera tarea
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
