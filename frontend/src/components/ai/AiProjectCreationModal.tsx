import React, { useState } from 'react';
import { Sparkles, Bot, Lightbulb, AlertCircle } from 'lucide-react';
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
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    {
      title: 'Tienda de Café de Especialidad',
      text: 'Quiero lanzar una tienda de café de especialidad online con catálogo de productos por origen, suscripción mensual recurrente, pasarela Stripe y blog con recetas de extracción.',
    },
    {
      title: 'App Móvil de Hábitos y Rutinas',
      text: 'Desarrollar una aplicación móvil para seguimiento de hábitos saludables. Debe tener login social, recordatorios automáticos con notificaciones push, estadísticas de racha y modo oscuro.',
    },
    {
      title: 'Migración a Clean Architecture',
      text: 'Refactorizar el backend monolítico de Node.js a FastAPI en Python con arquitectura limpia, SQLAlchemy 2.0, tests con Pytest y despliegue en contenedores Docker.',
    },
  ];

  const handleSelectExample = (exampleText: string) => {
    setPrompt(exampleText);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 5) {
      setError('Por favor describe tu idea con al menos 5 caracteres.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      await onGenerate(prompt.trim());
      setPrompt('');
      onClose();
    } catch (err: any) {
      setError(
        err.message ||
          'Error al invocar al Agente Organizador IA. Asegúrate de que el backend esté activo y tenga configurada la API Key en el archivo .env.'
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
      subtitle="Introduce tus ideas, notas sueltas o el alcance bruto y la IA estructurará el proyecto y sus fases"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Notas o alcance en bruto del proyecto *</span>
            <span className="text-[11px] text-slate-400 lowercase font-normal">
              Structured Outputs / JSON Schema
            </span>
          </label>
          <textarea
            rows={5}
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="Ejemplo: Necesito crear una plataforma web para agendar citas médicas con recordatorios por WhatsApp, panel para los doctores y módulo de pagos en línea..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all leading-relaxed"
          />
        </div>

        {/* Ejemplos rápidos */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>O elige una idea predefinida para probar:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExample(item.text)}
                disabled={isGenerating}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-slate-900 transition-all text-left cursor-pointer"
              >
                ✨ {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Estado de generación activa */}
        {isGenerating && (
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-3 animate-pulse">
            <Bot className="w-5 h-5 text-indigo-400 animate-spin" />
            <div>
              <p className="font-semibold text-white">Descomponiendo ideas con Structured Outputs...</p>
              <p className="text-slate-400 text-[11px]">
                Validando esquema estricto (título, descripción, plazos y tareas ordenadas con prioridad)
              </p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="ai"
            size="md"
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {isGenerating ? 'Estructurando con IA...' : 'Generar Proyecto con IA'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
