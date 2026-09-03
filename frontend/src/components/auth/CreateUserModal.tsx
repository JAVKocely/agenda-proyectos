import React, { useState } from 'react';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { projectsApi } from '../../api/projectsApi';
import type { UserProfile } from '../../types/project';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: UserProfile) => void;
}

export const COLOR_THEMES = [
  { id: 'fuchsia', label: 'Fucsia / Rosa', gradient: 'from-fuchsia-500 via-rose-500 to-amber-400', ring: 'ring-fuchsia-500' },
  { id: 'cyan', label: 'Cyan / Índigo', gradient: 'from-indigo-500 via-cyan-500 to-teal-400', ring: 'ring-cyan-500' },
  { id: 'emerald', label: 'Esmeralda / Menta', gradient: 'from-emerald-500 via-teal-500 to-cyan-400', ring: 'ring-emerald-500' },
  { id: 'amber', label: 'Ámbar / Naranja', gradient: 'from-amber-500 via-orange-500 to-rose-500', ring: 'ring-amber-500' },
  { id: 'violet', label: 'Púrpura / Violeta', gradient: 'from-violet-600 via-purple-500 to-fuchsia-500', ring: 'ring-purple-500' },
  { id: 'rose', label: 'Rubí / Coral', gradient: 'from-rose-500 via-pink-500 to-amber-400', ring: 'ring-rose-500' },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('cyan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTheme = COLOR_THEMES.find((c) => c.id === selectedColor) || COLOR_THEMES[1];
  const initialLetter = (name.trim().charAt(0) || 'U').toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor escribe un nombre para el usuario o equipo.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const newUser = await projectsApi.createUser({
        name: cleanName,
        color: selectedColor,
      });

      setName('');
      onUserCreated(newUser);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el usuario en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Nuevo Usuario"
      subtitle="Crea un espacio de trabajo con base de datos y consola 100% aislada"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Vista Previa del Avatar en Vivo */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 dark:bg-slate-950 border border-slate-800">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${activeTheme.gradient} p-1 mb-2.5 shadow-lg shadow-indigo-500/20 transition-transform duration-300`}>
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {initialLetter}
            </div>
          </div>
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            {name.trim() || 'Nuevo Usuario'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Consola Personal Aislada</span>
        </div>

        {/* Campo de Nombre */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Nombre del Usuario o Equipo *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Carlos, Ana, Marketing..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-medium"
          />
        </div>

        {/* Selector de Color y Tema del Avatar */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Tema / Color del Avatar
          </label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_THEMES.map((theme) => {
              const isSelected = selectedColor === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedColor(theme.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-800/80 border-indigo-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${theme.gradient} flex-shrink-0`} />
                  <span className="text-[11px] font-medium text-slate-300 truncate">
                    {theme.label.split(' / ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón de Creación */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creando espacio en base de datos...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-white" />
                <span>Crear Usuario e Ingresar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
