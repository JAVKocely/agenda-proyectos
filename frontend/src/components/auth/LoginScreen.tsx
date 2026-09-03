import React from 'react';
import { ShieldCheck, ArrowRight, FolderKanban, Sparkles } from 'lucide-react';

export type UserId = 'meli' | 'jhon';

interface LoginScreenProps {
  onSelectUser: (user: UserId) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSelectUser }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans select-none">
      {/* Luces de Fondo Decorativas */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-600/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">mml.solutions</span>
            <span className="block text-xs text-slate-400">Work OS Multi-Consola</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistema Seguro en Línea</span>
        </div>
      </header>

      {/* Contenido Central: Selección de Usuario */}
      <main className="max-w-4xl mx-auto w-full my-auto py-12 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Acceso Privado e Independiente</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          ¿Quién está ingresando hoy?
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
          Selecciona tu perfil. Cada consola cuenta con su propia base de datos y tableros 100% aislados.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Tarjeta de MELI */}
          <div
            onClick={() => onSelectUser('meli')}
            className="group relative bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 hover:border-fuchsia-500/60 rounded-3xl p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/10 cursor-pointer flex flex-col items-center text-center"
          >
            {/* Avatar Meli */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400 p-1 mb-5 shadow-xl shadow-fuchsia-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                M
              </div>
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-[11px] font-semibold mb-2">
              Consola Personal
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-fuchsia-300 transition-colors">
              MELI
            </h2>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Accede a tus proyectos, tareas por fases, cronogramas y métricas privadas.
            </p>

            <button className="w-full mt-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 group-hover:from-fuchsia-500 group-hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-600/25 transition-all">
              <span>Entrar como Meli</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Tarjeta de JHON */}
          <div
            onClick={() => onSelectUser('jhon')}
            className="group relative bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer flex flex-col items-center text-center"
          >
            {/* Avatar Jhon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-500 to-teal-400 p-1 mb-5 shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                J
              </div>
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-semibold mb-2">
              Consola Personal
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-cyan-300 transition-colors">
              JHON
            </h2>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Accede a tus proyectos, tareas por fases, cronogramas y métricas privadas.
            </p>

            <button className="w-full mt-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 group-hover:from-indigo-500 group-hover:to-cyan-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all">
              <span>Entrar como Jhon</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Datos persistentes y cifrados en Neon PostgreSQL</span>
        </div>
        <span>mml.solutions © 2026 • Todos los derechos reservados</span>
      </footer>
    </div>
  );
};
