import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { TaskCreatePayload, TaskPriority, TaskStatus, ProjectSummary } from '../../types/project';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectSummary[];
  selectedProjectId: string | null;
  onAddTask: (projectId: string, payload: TaskCreatePayload) => Promise<void>;
  onCreateDefaultProjectAndTask?: (payload: TaskCreatePayload) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  projects,
  selectedProjectId,
  onAddTask,
  onCreateDefaultProjectAndTask,
}) => {
  const [targetProjectId, setTargetProjectId] = useState<string>(
    selectedProjectId || (projects[0]?.id ?? '')
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupName, setGroupName] = useState('General');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar targetProjectId cuando cambia el proyecto seleccionado
  React.useEffect(() => {
    if (selectedProjectId) {
      setTargetProjectId(selectedProjectId);
    } else if (projects.length > 0) {
      setTargetProjectId(projects[0].id);
    }
  }, [selectedProjectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título de la tarea es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: TaskCreatePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        group_name: groupName.trim() || 'General',
        priority,
        status,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      if (targetProjectId) {
        await onAddTask(targetProjectId, payload);
      } else if (onCreateDefaultProjectAndTask) {
        await onCreateDefaultProjectAndTask(payload);
      } else {
        setError('No hay un tablero activo para asignar esta tarea. Crea un proyecto primero.');
        return;
      }

      // Limpiar formulario y cerrar
      setTitle('');
      setDescription('');
      setGroupName('General');
      setPriority('medium');
      setStatus('pending');
      setDueDate('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarea.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tarea"
      subtitle="Crea y asigna una tarea puntual a tu tablero de trabajo"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Selector de Proyecto / Tablero de destino */}
        {projects.length > 1 && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tablero / Proyecto Destino
            </label>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Título de la Tarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Título de la Tarea *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Diseñar arquitectura de contratos y endpoints"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Fase / Grupo */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Fase o Grupo
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Ej: FASE 1: ESPECIFICACIÓN, Desarrollo, General..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Prioridad y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Prioridad
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Crítica / Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En proceso</option>
              <option value="stuck">Estancado</option>
              <option value="completed">Listo</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Descripción y Notas
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles sobre lo que se debe realizar en esta tarea..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Fecha Límite */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Fecha Límite (Opcional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Guardar Tarea
          </Button>
        </div>
      </form>
    </Modal>
  );
};
