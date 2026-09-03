import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/monday/Sidebar';
import { Topbar, type ActiveView } from './components/monday/Topbar';
import { MainTable } from './components/monday/MainTable';
import { KanbanView } from './components/monday/KanbanView';
import { TimelineView } from './components/monday/TimelineView';
import { LoginScreen, type UserId } from './components/auth/LoginScreen';
import { AiProjectCreationModal } from './components/ai/AiProjectCreationModal';
import { TaskModal } from './components/dashboard/TaskModal';
import { projectsApi } from './api/projectsApi';
import type {
  ProjectSummary,
  ProjectDetail,
  TaskStatus,
  TaskPriority,
  TaskCreatePayload,
} from './types/project';
import { AlertCircle, Loader2, Sparkles, FolderKanban, Plus } from 'lucide-react';

export function App() {
  // Estado del usuario activo ('meli' | 'jhon' | null)
  const [currentUser, setCurrentUser] = useState<UserId | null>(() => {
    const saved = localStorage.getItem('mml_active_user');
    if (saved === 'meli' || saved === 'jhon') {
      return saved;
    }
    return null;
  });

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ProjectDetail | null>(null);

  const [activeView, setActiveView] = useState<ActiveView>('table');
  const [boardSearch, setBoardSearch] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);

  // Estado del tema ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('mml_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'dark';
  });

  const handleToggleTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('mml_theme', newTheme);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar lista de proyectos del usuario activo
  const loadProjects = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await projectsApi.getProjects();
      setProjects(data);

      if (data.length > 0) {
        setSelectedProjectId((prev) => {
          const exists = data.some((p) => p.id === prev);
          return exists ? prev : data[0].id;
        });
      } else {
        setSelectedProjectId(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con la API de proyectos');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser, loadProjects]);

  // Cargar detalle del proyecto seleccionado
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

  // Manejo de Inicio y Cierre de Sesión
  const handleSelectUser = (user: UserId) => {
    localStorage.setItem('mml_active_user', user);
    setCurrentUser(user);
    setSelectedProjectId(null);
    setSelectedProjectDetail(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('mml_active_user');
    setCurrentUser(null);
    setProjects([]);
    setSelectedProjectId(null);
    setSelectedProjectDetail(null);
  };

  // Filtro de tareas en el tablero actual
  const filteredTasks = useMemo(() => {
    if (!selectedProjectDetail) return [];
    if (!boardSearch.trim()) return selectedProjectDetail.tasks;
    const query = boardSearch.toLowerCase().trim();
    return selectedProjectDetail.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.group_name && t.group_name.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query))
    );
  }, [selectedProjectDetail, boardSearch]);

  // Acciones de Proyectos
  const handleGenerateWithAI = async (prompt: string) => {
    const generated = await projectsApi.generateProjectWithAI({ prompt });
    await loadProjects();
    setSelectedProjectId(generated.id);
  };

  // Acciones de Tareas
  const handleAddTaskFromModal = async (projectId: string, payload: TaskCreatePayload) => {
    await projectsApi.addTask(projectId, payload);
    if (selectedProjectId === projectId) {
      await loadProjectDetail(projectId);
    }
    projectsApi.getProjects().then(setProjects);
  };

  const handleCreateDefaultProjectAndTask = async (payload: TaskCreatePayload) => {
    const isMeli = currentUser === 'meli';
    const defaultTitle = isMeli ? 'Tablero de Meli' : 'Tablero de Jhon';
    const newProj = await projectsApi.createProject({
      title: defaultTitle,
      description: 'Espacio de trabajo general',
      status: 'active',
      estimated_completion_days: 14,
    });
    await projectsApi.addTask(newProj.id, payload);
    await loadProjects();
    setSelectedProjectId(newProj.id);
  };

  const handleUpdateTask = async (
    taskId: string,
    payload: { status?: TaskStatus; priority?: TaskPriority; title?: string }
  ) => {
    await projectsApi.updateTask(taskId, payload);
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
      projectsApi.getProjects().then(setProjects);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('¿Deseas eliminar este elemento?')) return;
    await projectsApi.deleteTask(taskId);
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
      projectsApi.getProjects().then(setProjects);
    }
  };

  const handleAddTaskInline = async (payload: TaskCreatePayload) => {
    if (!selectedProjectId) return;
    await projectsApi.addTask(selectedProjectId, payload);
    await loadProjectDetail(selectedProjectId);
    projectsApi.getProjects().then(setProjects);
  };

  // Si no hay usuario seleccionado, mostrar la pantalla de ingreso para MELI y JHON
  if (!currentUser) {
    return <LoginScreen onSelectUser={handleSelectUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-indigo-500 selection:text-white font-sans">
      {/* Barra Lateral personalizada para Meli / Jhon */}
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenManualModal={() => setIsTaskModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Área Principal de Trabajo */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Barra Superior */}
        <Topbar
          project={selectedProjectDetail}
          activeView={activeView}
          onViewChange={setActiveView}
          searchFilter={boardSearch}
          onSearchChange={setBoardSearch}
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Mensaje de Alerta si ocurre un error */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white underline cursor-pointer text-xs"
            >
              Descartar
            </button>
          </div>
        )}

        {/* Contenedor de la Vista Activa */}
        <div className="flex-1 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
              <p className="text-sm font-medium">Cargando consola de {currentUser === 'meli' ? 'Meli' : 'Jhon'}...</p>
            </div>
          ) : projects.length === 0 ? (
            /* Estado de Bienvenida cuando no hay tableros en esta consola */
            <div className="max-w-xl mx-auto my-16 text-center p-8 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl backdrop-blur-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 mx-auto mb-5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <FolderKanban className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Consola privada de {currentUser === 'meli' ? 'Meli' : 'Jhon'}
              </h2>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Este espacio de trabajo te pertenece exclusivamente a ti. Puedes crear un proyecto completo estructurado con IA o agregar tareas individuales.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Crear Proyecto</span>
                </button>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Tarea</span>
                </button>
              </div>
            </div>
          ) : isDetailLoading || !selectedProjectDetail ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
              <p className="text-xs">Cargando tablero...</p>
            </div>
          ) : (
            /* Render de Vistas Dinámicas */
            <div>
              {activeView === 'table' && (
                <MainTable
                  tasks={filteredTasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTaskInline}
                />
              )}

              {activeView === 'kanban' && (
                <KanbanView
                  tasks={filteredTasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTaskInline}
                />
              )}

              {activeView === 'timeline' && (
                <TimelineView
                  tasks={filteredTasks}
                  estimatedDays={selectedProjectDetail.estimated_completion_days}
                  targetDate={selectedProjectDetail.target_date}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Creación de Proyecto con IA */}
      <AiProjectCreationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={handleGenerateWithAI}
      />

      {/* Modal de Creación de Tarea Puntual (Título: Tarea) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onAddTask={handleAddTaskFromModal}
        onCreateDefaultProjectAndTask={handleCreateDefaultProjectAndTask}
      />
    </div>
  );
}

export default App;
