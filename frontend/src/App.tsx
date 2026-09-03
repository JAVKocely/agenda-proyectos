import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/monday/Sidebar';
import { Topbar, type ActiveView } from './components/monday/Topbar';
import { MainTable } from './components/monday/MainTable';
import { KanbanView } from './components/monday/KanbanView';
import { TimelineView } from './components/monday/TimelineView';
import { LoginScreen } from './components/auth/LoginScreen';
import { AiProjectCreationModal } from './components/ai/AiProjectCreationModal';
import { TaskModal } from './components/dashboard/TaskModal';
import { ArchiveConfirmationModal } from './components/dashboard/ArchiveConfirmationModal';
import { CreateUserModal } from './components/auth/CreateUserModal';
import { projectsApi } from './api/projectsApi';
import type {
  ProjectSummary,
  ProjectDetail,
  TaskCreatePayload,
  TaskUpdatePayload,
  UserProfile,
} from './types/project';
import { AlertCircle, Loader2, Sparkles, FolderKanban, Plus, Archive, RotateCcw } from 'lucide-react';

export function App() {
  // Estado del usuario activo (string | null)
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('mml_active_user') || null;
  });

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ProjectDetail | null>(null);

  const [activeView, setActiveView] = useState<ActiveView>('table');
  const [boardSearch, setBoardSearch] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState<boolean>(false);
  const [projectToArchivePrompt, setProjectToArchivePrompt] = useState<ProjectDetail | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'projects' | 'tasks'>('all');
  const [users, setUsers] = useState<UserProfile[]>([]);

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

  // Cargar detalle del proyecto seleccionado
  const loadProjectDetail = useCallback(async (id: string, isSilent = false) => {
    try {
      if (!isSilent) {
        setIsDetailLoading(true);
      }
      const detail = await projectsApi.getProject(id);
      setSelectedProjectDetail(detail);
      return detail;
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al cargar el detalle del proyecto');
      return null;
    } finally {
      if (!isSilent) {
        setIsDetailLoading(false);
      }
    }
  }, []);

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
          const nextId = prev && data.some((p) => p.id === prev) ? prev : data[0].id;
          // Cargar inmediatamente el detalle para asegurar que la tabla se monte
          loadProjectDetail(nextId);
          return nextId;
        });
      } else {
        setSelectedProjectId(null);
        setSelectedProjectDetail(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con la API de proyectos');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, loadProjectDetail]);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser, loadProjects]);

  // Cargar lista de miembros registrados en la base de datos
  const loadUsers = useCallback(async () => {
    try {
      const data = await projectsApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Error al cargar lista de usuarios:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUserCreated = (newUser: UserProfile) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id.toLowerCase() === newUser.id.toLowerCase());
      return exists ? prev : [...prev, newUser];
    });
    setIsCreateUserModalOpen(false);
    handleSelectUser(newUser.id);
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetail(selectedProjectId);
    } else {
      setSelectedProjectDetail(null);
    }
  }, [selectedProjectId, loadProjectDetail]);

  // Manejo de Inicio y Cierre de Sesión
  const handleSelectUser = (user: string) => {
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

  // Filtro de tareas en el tablero actual con soporte para tipo de filtro (proyectos / tareas)
  const filteredTasks = useMemo(() => {
    if (!selectedProjectDetail) return [];
    const list = selectedProjectDetail.tasks;
    const query = boardSearch.toLowerCase().trim();

    if (filterType === 'tasks') {
      if (!query) return list;
      return list.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    if (filterType === 'projects') {
      if (!query) return list;
      return list.filter(
        (t) =>
          selectedProjectDetail.title.toLowerCase().includes(query) ||
          (t.group_name && t.group_name.toLowerCase().includes(query))
      );
    }

    if (!query) return list;
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.group_name && t.group_name.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query))
    );
  }, [selectedProjectDetail, boardSearch, filterType]);

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
    payload: TaskUpdatePayload
  ) => {
    // 1. Actualización optimista inmediata en memoria (sin parpadeos ni desmontaje del cuadro)
    setSelectedProjectDetail((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, ...payload };
        }
        return t;
      });

      const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
      const progress =
        updatedTasks.length > 0
          ? Math.round((completedCount / updatedTasks.length) * 100)
          : 0;

      return {
        ...prev,
        tasks: updatedTasks,
        completed_tasks: completedCount,
        progress_percentage: progress,
      };
    });

    try {
      // 2. Persistir en la API en segundo plano
      await projectsApi.updateTask(taskId, payload);

      // 3. Sincronizar en segundo plano silenciosamente
      if (selectedProjectId) {
        const updated = await loadProjectDetail(selectedProjectId, true);
        projectsApi.getProjects().then(setProjects);

        // Si la tarea se marcó como lista ('completed'), verificar si se cumplieron TODAS las tareas
        if (
          payload.status === 'completed' &&
          updated &&
          updated.status !== 'archived' &&
          updated.tasks.length > 0 &&
          updated.tasks.every((t) => t.status === 'completed')
        ) {
          setProjectToArchivePrompt(updated);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar la tarea');
      if (selectedProjectId) {
        loadProjectDetail(selectedProjectId, true);
      }
    }
  };

  const handleConfirmArchive = async (projectId: string) => {
    await projectsApi.updateProject(projectId, { status: 'archived' });
    await loadProjects();
    await loadProjectDetail(projectId, true);
  };

  const handleUnarchiveProject = async (projectId: string) => {
    await projectsApi.updateProject(projectId, { status: 'active' });
    await loadProjects();
    await loadProjectDetail(projectId, true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('¿Deseas eliminar este elemento?')) return;

    // Actualización optimista al eliminar
    setSelectedProjectDetail((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.tasks.filter((t) => t.id !== taskId);
      const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
      const progress =
        updatedTasks.length > 0
          ? Math.round((completedCount / updatedTasks.length) * 100)
          : 0;
      return {
        ...prev,
        tasks: updatedTasks,
        completed_tasks: completedCount,
        progress_percentage: progress,
      };
    });

    try {
      await projectsApi.deleteTask(taskId);
      if (selectedProjectId) {
        await loadProjectDetail(selectedProjectId, true);
        projectsApi.getProjects().then(setProjects);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al eliminar la tarea');
      if (selectedProjectId) {
        loadProjectDetail(selectedProjectId, true);
      }
    }
  };

  const handleAddTaskInline = async (payload: TaskCreatePayload) => {
    if (!selectedProjectId) return;
    await projectsApi.addTask(selectedProjectId, payload);
    await loadProjectDetail(selectedProjectId, true);
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
        onSelectProject={(id) => {
          setSelectedProjectId(id);
          loadProjectDetail(id);
        }}
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
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          users={users}
          onSwitchUser={handleSelectUser}
          onOpenCreateUserModal={() => setIsCreateUserModalOpen(true)}
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setErrorMessage(null);
                  loadProjects();
                  if (selectedProjectId) {
                    loadProjectDetail(selectedProjectId);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold cursor-pointer text-xs transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white underline cursor-pointer text-xs"
              >
                Descartar
              </button>
            </div>
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 mx-auto mb-5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <FolderKanban className="folder-welcome-icon w-8 h-8 text-indigo-600 dark:text-cyan-400 transition-colors" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Consola privada de {currentUser === 'meli' ? 'Meli' : currentUser === 'jhon' ? 'Jhon' : currentUser}
              </h2>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Este espacio de trabajo te pertenece exclusivamente a ti. Puedes crear un proyecto completo estructurado con IA o agregar tareas individuales.
              </p>
              <div className="flex items-center justify-center gap-3.5">
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="btn-proyecto h-11 px-5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/35 hover:shadow-indigo-500/55 border border-transparent cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Crear Proyecto</span>
                </button>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="btn-tarea h-11 px-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white border border-transparent cursor-pointer flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200 hover:scale-[1.02] leading-none"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                  <span className="leading-none">Crear Tarea</span>
                </button>
              </div>

              {/* Acceso rápido a otras consolas si esta está vacía */}
              {users.filter((u) => u.id !== currentUser).length > 0 && (
                <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                  <span>¿Deseas revisar otra consola?</span>
                  {users
                    .filter((u) => u.id !== currentUser)
                    .map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold hover:text-white transition-colors cursor-pointer"
                      >
                        Entrar a consola de {u.name} →
                      </button>
                    ))}
                </div>
              )}
            </div>

          ) : !selectedProjectDetail ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              {isDetailLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
                  <p className="text-xs">Cargando tablero...</p>
                </>
              ) : (
                <p className="text-xs">Selecciona un proyecto de la barra lateral</p>
              )}
            </div>
          ) : (
            /* Render de Vistas Dinámicas */
            <div>
              {/* Banner de Consulta de Proyecto en Archivo Histórico */}
              {selectedProjectDetail.status === 'archived' && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400">
                      <Archive className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-200 text-sm">
                        Proyecto en Archivo Histórico
                      </p>
                      <p className="text-[11px] text-amber-300/80">
                        Este proyecto y todas sus tareas cumplidas están resguardados en la base de datos para consulta posterior.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnarchiveProject(selectedProjectDetail.id)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 flex-shrink-0"
                    title="Devolver este proyecto a la lista de tableros activos"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar al Tablero Activo</span>
                  </button>
                </div>
              )}

              {activeView === 'table' && (
                <MainTable
                  tasks={filteredTasks}
                  users={users}
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

      {/* Modal de Confirmación para Pasar a Archivo */}
      <ArchiveConfirmationModal
        isOpen={!!projectToArchivePrompt}
        project={projectToArchivePrompt}
        onClose={() => setProjectToArchivePrompt(null)}
        onConfirmArchive={handleConfirmArchive}
      />

      {/* Modal para Crear/Registrar un Nuevo Miembro */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}

export default App;
