import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, UserPlus, Sparkles, Trash2 } from 'lucide-react';
import { projectsApi } from '../../api/projectsApi';
import { CreateUserModal, COLOR_THEMES } from './CreateUserModal';
import type { UserProfile } from '../../types/project';

interface LoginScreenProps {
  onSelectUser: (userId: string) => void;
}

const DEFAULT_USERS: UserProfile[] = [
  { id: 'meli', name: 'MELI', color: 'fuchsia' },
  { id: 'jhon', name: 'JHON', color: 'cyan' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSelectUser }) => {
  const [users, setUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDeleteUser = async (e: React.MouseEvent, user: UserProfile) => {
    e.stopPropagation();
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.name}" y todos sus proyectos?`)) {
      return;
    }
    try {
      await projectsApi.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar usuario');
    }
  };

  // Cargar usuarios desde la base de datos
  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      try {
        const data = await projectsApi.getUsers();
        if (isMounted && data && data.length > 0) {
          setUsers(data);
        }
      } catch {
        // En caso de fallo de red inicial, mantener usuarios por defecto
      }
    };
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUserCreated = (newUser: UserProfile) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === newUser.id);
      return exists ? prev : [...prev, newUser];
    });
    // Ingresar de inmediato a la nueva consola creada
    onSelectUser(newUser.id);
  };

  const getThemeForUser = (color?: string) => {
    return COLOR_THEMES.find((c) => c.id === color) || COLOR_THEMES[1];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans select-none">
      {/* Luces de Fondo Decorativas Suaves */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Superior Minimalista */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full relative z-10">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm hover:scale-105"
          title="Crear un nuevo usuario con base de datos independiente"
        >
          <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
          <span>+ Agregar Usuario</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-emerald-400 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistema Seguro en Línea</span>
        </div>
      </header>

      {/* Contenido Central: Logo en Negativo + Tarjetas de Usuarios */}
      <main className="max-w-5xl mx-auto w-full my-auto py-6 relative z-10 text-center">
        {/* Logo Central en Negativo, Sin Marco y Tamaño Grande */}
        <div className="flex items-center justify-center mb-10">
          <img
            src="/logo.png"
            alt="MML Enterprises Logo"
            className="w-64 sm:w-72 md:w-80 h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] select-none transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Tarjetas de Usuarios Registrados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {users.map((user) => {
            const theme = getThemeForUser(user.color);
            const initial = (user.name.charAt(0) || 'U').toUpperCase();

            return (
              <div
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className="group relative bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 hover:border-slate-700 rounded-3xl p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col items-center text-center"
              >
                {/* Botón para eliminar usuario personalizado */}
                {user.id !== 'meli' && user.id !== 'jhon' && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteUser(e, user)}
                    className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title={`Eliminar usuario ${user.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Avatar con gradiente personalizado */}
                <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${theme.gradient} p-1 mb-4 shadow-xl transition-transform group-hover:scale-105`}>
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {initial}
                  </div>
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[11px] font-semibold mb-2">
                  Consola Personal
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight truncate max-w-[200px] uppercase">
                  {user.name}
                </h2>

                <p className="text-xs text-slate-400 mb-6 leading-relaxed line-clamp-2">
                  Proyectos, tareas por fases, cronogramas y métricas 100% aisladas.
                </p>

                <button
                  type="button"
                  className={`w-full mt-auto py-2.5 px-4 rounded-xl bg-gradient-to-r ${theme.gradient} text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer`}
                >
                  <span>Entrar como {user.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}

          {/* Tarjeta para "+ Agregar Usuario" */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="group relative bg-slate-950/40 border-2 border-dashed border-slate-800 hover:border-indigo-500/80 rounded-3xl p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col items-center justify-center text-center min-h-[320px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 group-hover:border-indigo-500/50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <UserPlus className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
              Agregar Usuario
            </h3>

            <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
              Crea una consola independiente con base de datos propia para un nuevo integrante o departamento.
            </p>

            <button
              type="button"
              className="py-2 px-4 rounded-xl bg-slate-900 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white border border-slate-800 group-hover:border-transparent text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Crear Espacio</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Bases de datos aisladas y persistentes en Neon PostgreSQL</span>
        </div>
        <span>mml.solutions © 2026 • Todos los derechos reservados</span>
      </footer>

      {/* Modal para Crear Usuario */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};
