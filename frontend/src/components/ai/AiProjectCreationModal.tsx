import React, { useState } from 'react';
import { Sparkles, Bot, AlertCircle, ListChecks } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface AiProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
}

export const AiProjectCreationModal: React.FC<AiProjectCreationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputText.trim();
    if (cleanInput.length < 5) {
      setError('Por favor introduce tu idea, requerimiento o listado de tareas (mínimo 5 caracteres).');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      await onGenerate(cleanInput);
      setInputText('');
      onClose();
    } catch (err: any) {
      setError(
        err.message ||
          'Error al invocar al Agente Organizador IA. Asegúrate de que el backend esté activo y conectado con Gemini.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agente Organizador IA"
      subtitle="Distribuye listados de tareas pre-elaborados por IA o requerimientos directamente en tu tablero"
      maxWidth="xl"
      accent="indigo"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Indicador de función */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <ListChecks className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>
            Cada paso o tarea detectada se colocará en una <strong>casilla individual</strong> con su duración, fecha y opción de chequeo.
          </span>
        </div>

        {/* Campo de Entrada: Idea o Requerimiento / Listado de Tareas */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Idea o Requerimiento (o Listado de Tareas de IA) *</span>
            <span className="text-[11px] text-slate-400 font-normal">
              Estructuración Automática
            </span>
          </label>
          <textarea
            rows={8}
            required
            autoFocus
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isGenerating}
            placeholder={`Pega aquí el listado de tareas previamente elaborado por otra IA o redacta tus requerimientos.

Ejemplo de listado:
1. Diseñar el modelo de datos relacional y migraciones (2 días)
2. Desarrollar endpoints de autenticación y usuarios (3 días)
3. Construir vistas principales y componentes modulares (4 días)
4. Configurar pasarela de pagos y notificaciones (2 días)
5. Pruebas unitarias, auditoría y despliegue final (1 día)

El agente organizador distribuirá cada tarea en una casilla con sus fechas y duración.`}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all leading-relaxed font-mono"
          />
        </div>

        {/* Estado de generación activa */}
        {isGenerating && (
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-3 animate-pulse">
            <Bot className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">
                Distribuyendo tareas en casillas individuales...
              </p>
              <p className="text-slate-400 text-[11px]">
                Asignando duraciones de ejecución, calculando fechas límites y preparando casillas de chequeo.
              </p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancelar
          </Button>
          <button
            type="submit"
            disabled={isGenerating || !inputText.trim()}
            className="btn-proyecto h-11 px-6 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Distribuyendo...' : 'Distribuir en Tablero'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
