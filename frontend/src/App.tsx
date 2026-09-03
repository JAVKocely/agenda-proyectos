import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { StatCards } from './components/layout/StatCards';
import { FilterBar } from './components/dashboard/FilterBar';
import { ProjectGrid } from './components/dashboard/ProjectGrid';
import { ProjectDetailHeader } from './components/detail/ProjectDetailHeader';
import { TaskList } from './components/detail/TaskList';
import { AddTaskModal } from './components/detail/AddTaskModal';
import { AiProjectCreationModal } from './components/ai/AiProjectCreationModal';
import { ManualProjectModal } from './components/dashboard/ManualProjectModal';
import { projectsApi } from './api/projectsApi';
import type {
  ProjectSummary,
  ProjectDetail,
  ProjectStatus,
  ProjectCreatePayload,
  TaskCreatePayload,
} from './types/project';
import { AlertCircle, Loader2 } from 'lucide-react';

export function App() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ProjectDetail | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar lista de proyectos
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await projectsApi.getProjects(filterStatus, searchQuery);
      setProjects(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con la API de proyectos');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Cargar detalle de proyecto seleccionado
  const loadProjectDetail = useCallback(async (id: string) => {
    try {
      setIsDetailLoading(true);
      const detail = await projectsApi.getProject(id);
      setSelectedProjectDetail(detail);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al cargar el detalle del proyecto');
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetail(selectedProjectId);
    } else {
      setSelectedProjectDetail(null);
    }
  }, [selectedProjectId, loadProjectDetail]);

  // Conteo de proyectos para las pestañas de filtro
  const statusCounts = useMemo(() => {
    return {
      all: projects.length,
      active: projects.filter((p) => p.status === 'active').length,
      paused: projects.filter((p) => p.status === 'paused').length,
      completed: projects.filter((p) => p.status === 'completed').length,
    };
  }, [projects]);

  // Acciones de Proyectos
  const handleCreateProjectManual = async (payload: ProjectCreatePayload) => {
    const created = await projectsApi.createProject(payload);
    await loadProjects();
    setSelectedProjectId(created.id);
  };

  const handleGenerateWithAI = async (prompt: string) => {
    const generated = await projectsApi.generateProjectWithAI({ prompt });
    await loadProjects();
    setSelectedProjectId(generated.id);
  };

  const handleUpdateProjectStatus = async (newStatus: ProjectStatus) => {
    if (!selectedProjectId) return;
    const updated = await projectsApi.updateProject(selectedProjectId, { status: newStatus });
    setSelectedProjectDetail(updated);
    await loadProjects();
  };

  const handleDeleteProject = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proyecto y todas sus fases asociadas?')) {
      return;
    }
    await projectsApi.deleteProject(id);
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
    await loadProjects();
  };

  // Acciones de Tareas
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await projectsApi.updateTask(taskId, { status: nextStatus });
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
      projectsApi.getProjects(filterStatus, searchQuery).then(setProjects);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('¿Deseas eliminar esta tarea?')) return;
    await projectsApi.deleteTask(taskId);
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
      projectsApi.getProjects(filterStatus, searchQuery).then(setProjects);
    }
  };

  const handleAddTask = async (payload: TaskCreatePayload) => {
    if (!selectedProjectId) return;
    await projectsApi.addTask(selectedProjectId, payload);
    await loadProjectDetail(selectedProjectId);
    projectsApi.getProjects(filterStatus, searchQuery).then(setProjects);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Cabecera Principal */}
      <Header
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onBackToDashboard={() => setSelectedProjectId(null)}
        isDetailView={!!selectedProjectId}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-rose-200 underline cursor-pointer"
            >
              Descartar
            </button>
          </div>
        )}

        {selectedProjectId ? (
          /* ================= VISTA DETALLE ================= */
          <div>
            {isDetailLoading || !selectedProjectDetail ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                <p className="text-sm">Cargando desglose de fases y reactividad del proyecto...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <ProjectDetailHeader
                  project={selectedProjectDetail}
                  onStatusChange={handleUpdateProjectStatus}
                  onDeleteProject={() => handleDeleteProject(selectedProjectDetail.id)}
                />

                <TaskList
                  tasks={selectedProjectDetail.tasks}
                  onToggleStatus={handleToggleTaskStatus}
                  onDeleteTask={handleDeleteTask}
                  onOpenAddTask={() => setIsAddTaskModalOpen(true)}
                />
              </div>
            )}
          </div>
        ) : (
          /* ================= DASHBOARD PRINCIPAL ================= */
          <div>
            {/* Estadísticas Resumidas */}
            <StatCards projects={projects} />

            {/* Barra de Filtros y Búsqueda */}
            <FilterBar
              currentStatus={filterStatus}
              onStatusChange={setFilterStatus}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              counts={statusCounts}
            />

            {/* Grid de Proyectos */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                <p className="text-sm">Cargando proyectos y métricas...</p>
              </div>
            ) : (
              <ProjectGrid
                projects={projects}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onDeleteProject={handleDeleteProject}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onOpenManualModal={() => setIsManualModalOpen(true)}
                isFiltered={filterStatus !== 'all' || searchQuery.trim().length > 0}
              />
            )}
          </div>
        )}
      </main>

      {/* Modales */}
      <AiProjectCreationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={handleGenerateWithAI}
      />

      <ManualProjectModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onCreate={handleCreateProjectManual}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
}

export default App;
