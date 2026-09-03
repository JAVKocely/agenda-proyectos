import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

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

      {/* Header Superior Minimalista */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full relative z-10">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          MML Enterprises
        </span>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistema Seguro en Línea</span>
        </div>
      </header>

      {/* Contenido Central: Logo Central Mediano + Tarjetas de Perfil */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8 relative z-10 text-center">
        {/* Logo Central Mediano */}
        <div className="flex flex-col items-center justify-center mb-10">
          <img
            src="/logo.png"
            alt="MML Enterprises Logo"
            className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-3xl p-3 bg-slate-900/80 border border-slate-800/90 shadow-2xl shadow-emerald-500/10 transition-transform hover:scale-105"
          />
          <h1 className="mt-4 text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            MML ENTERPRISES
          </h1>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-400 mt-1">
            Work OS Multi-Consola
          </span>
        </div>

        {/* Tarjetas de MELI y JHON */}
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
          <span>Bases de datos aisladas y persistentes en Neon PostgreSQL</span>
        </div>
        <span>mml.solutions © 2026 • Todos los derechos reservados</span>
      </footer>
    </div>
  );
};
