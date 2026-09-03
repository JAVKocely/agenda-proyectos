import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bot, AlertCircle, Code2, Terminal, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface AiProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
}

const SOP_AI_SDLC_BODY = `# STANDARD OPERATING PROCEDURE (SOP): INGENIERÍA Y CONSTRUCCIÓN DE SOFTWARE ASISTIDA POR IA (AI-SDLC)

> **PROPÓSITO:** Este estándar define el marco normativo, técnico y metodológico estricto que cualquier Inteligencia Artificial o equipo de ingeniería debe seguir para planificar, diseñar, estructurar y programar software robusto, modular, escalable y mantenible. Ninguna fase puede omitirse.

---

## 1. DIRECTRICES DE EJECUCIÓN PARA LA IA (REGLAS MANDATORIAS)

Cuando este documento sea provisto como contexto o *system prompt* a cualquier modelo de IA (Gemini, Claude, GPT, Llama, Cursor, etc.), la IA **debe acatar de forma estricta** las siguientes reglas operativas:

1. **PROHIBIDO EL MONOLITO EN UN SOLO PASO:** No generar todo el código de golpe. Toda aplicación debe descomponerse en fases iterativas según este documento.
2. **ESPECIFICACIÓN ANTES DE CÓDIGO (Spec-First):** Antes de emitir una sola línea de código ejecutable, la IA debe validar y solicitar confirmación de la arquitectura, esquema de datos y contratos de API.
3. **RESPUESTAS TIPADAS Y ESTRUCTURADAS:** Todo output de servicios de backend o IA debe adherirse a esquemas rígidos (JSON Schema / Pydantic / Zod). No se admiten respuestas en texto no validables para la lógica del sistema.
4. **MODULARIDAD Y AISLAMIENTO:** Cada archivo debe tener una única responsabilidad (Single Responsibility Principle). Separar ruteo, controladores, servicios/casos de uso, acceso a datos y clientes externos.
5. **TRATAMIENTO RIGUROSO DE ERRORES:** Todo endpoint, función asíncrona o llamada externa a API debe implementar bloques controlados de manejo de excepciones, logs estructurados y códigos de estado HTTP semánticos.
6. **SEGURIDAD ZERO-TRUST:** Credenciales, llaves de API, secretos de base de datos y tokens nunca van en el código. Siempre mediante variables de entorno (\`.env\`) validadas al arrancar la app.

---

## 2. STACK TECNOLÓGICO ESTÁNDAR Y HERRAMIENTAS

Para garantizar interoperabilidad y rendimiento, se definen los siguientes componentes tecnológicos por capa:

### 2.1. Backend y Lógica de Negocio
* **Opción A (Alta Concurrencia y Datos / IA):** Python 3.11+ con **FastAPI** + Pydantic v2 + Uvicorn.
* **Opción B (Fullstack / APIs Rápidas):** TypeScript con **Node.js** (NestJS o Express con tipado estricto).
* **Gestor de Entorno / Paquetes:** Poetry o \`uv\` (Python) / pnpm o npm (Node/TypeScript).

### 2.2. Capa de Base de Datos y Persistencia
* **Relacional Principal:** **PostgreSQL** (versión 15+).
* **Capa Vectorial (RAG / Búsqueda Semántica):** Extensión \`pgvector\` sobre PostgreSQL (evita bases de datos dispersas) o Qdrant/Pinecone para escala masiva.
* **Caché y Mensajería / Colas:** **Redis** (manejo de sesiones, rate limiting y colas de tareas en segundo plano con Celery o BullMQ).
* **ORM / Migraciones:** Alembic + SQLAlchemy 2.0 (Python) o Prisma / Drizzle ORM (TypeScript).

### 2.3. Capa de Inteligencia Artificial y LLMs
* **Inferencia de Ultra Baja Latencia:** **Groq Cloud API** (usando modelos abiertos como \`llama-3.1-70b\` o \`llama-3.1-8b\`) para agentes en tiempo real, validaciones y tareas que requieren menos de 300ms de respuesta.
* **Inferencia de Razonamiento Complejo y Multimodal:** **Gemini API** (\`gemini-1.5-pro\` / \`gemini-1.5-flash\`) o Claude / OpenAI para análisis profundo de documentos, visión o contextos ultra largos.
* **Orquestación de Agentes y Flujos:** LangGraph / LlamaIndex para código estructurado; **n8n** para pipelines de automatización e integraciones externas visuales.

### 2.4. Frontend y Experiencia de Usuario
* **Framework:** Next.js (App Router) o React + Vite con TypeScript.
* **Estilos y Componentes:** Tailwind CSS + componentes modulares headless (shadcn/ui o Radix UI).
* **Gestión de Estado y Servidor:** TanStack Query (React Query) para caché y sincronización con API.

### 2.5. DevOps, Seguridad y Calidad
* **Contenedores:** Docker y Docker Compose para desarrollo local idéntico a producción.
* **Validación de Código:** Flake8/Black/Ruff (Python) o ESLint/Prettier (TypeScript).
* **Testing:** Pytest (Python) o Vitest/Jest (JS/TS) con cobertura mínima del 80% en casos de uso core.

---

## 3. PROCESO DE DESARROLLO EN 5 ETAPAS (PIPELINE ESTÁNDAR)

Cada nuevo software debe desarrollarse completando obligatoriamente las siguientes 5 fases en orden:

[FASE 1: ESPECIFICACIÓN] ➔ [FASE 2: ARQUITECTURA] ➔ [FASE 3: IMPLEMENTACIÓN CORE] ➔ [FASE 4: CAPA IA & INTEGRACIÓN] ➔ [FASE 5: QA & DESPLIEGUE]

### FASE 1: ESPECIFICACIÓN TÉCNICA Y REQUERIMIENTOS
Antes de programar, la IA debe generar y documentar:
1. **Definición de Entidades y Modelos:** Lista de sustantivos clave del negocio y sus atributos.
2. **Casos de Uso (User Stories):** Acciones concretas estructuradas: *Como [Rol], quiero [Acción], para [Beneficio]*.
3. **Restricciones No Funcionales:** Latencia máxima permitida, concurrencia estimada, privacidad de datos.

### FASE 2: ARQUITECTURA Y CONTRATOS DE DATOS
1. **Diagrama de Estructura de Directorios:** Según el patrón de Arquitectura Limpia / Hexagonal (ver sección 4).
2. **Esquema de Base de Datos (DDL):** Definición formal de tablas, claves primarias, foráneas, índices y tipos de datos.
3. **Contrato de API (OpenAPI / Endpoints):** Especificación exhaustiva de endpoints HTTP, métodos, query params, request body y respuestas (códigos 200, 400, 401, 404, 500).

### FASE 3: IMPLEMENTACIÓN DEL CORE Y BASE DE DATOS
1. Inicialización del entorno, configuración de variables (\`.env.example\`) y Docker Compose.
2. Modelos ORM y migraciones iniciales de base de datos.
3. Repositorios de acceso a datos desacoplados de la lógica de negocio.
4. Servicios y casos de uso con validaciones de negocio independientes de la API web.
5. Endpoints y controladores HTTP con validación mediante DTOs/esquemas.

### FASE 4: CAPA DE INTELIGENCIA ARTIFICIAL (SI APLICA)
1. **Aislamiento del Proveedor de IA:** La lógica de llamadas a LLMs debe encapsularse en una clase/cliente independiente (\`AIClientInterface\`), permitiendo alternar entre Groq, Gemini u OpenAI sin tocar la lógica de negocio.
2. **Diseño de Prompts del Sistema:** Guardados en archivos de configuración o plantillas dedicadas, no hardcodeados en el controlador.
3. **Esquema de Salida Obligatorio (Structured Output):** Uso estricto de llamadas de función (*tool calling*) o modo JSON forzado mediante Pydantic.
4. **Estrategia de Fallback y Reintentos:** Manejo de límites de cuota (Rate Limits, HTTP 429) con backoff exponencial.

### FASE 5: QA, PRUEBAS Y VALIDACIÓN
1. **Pruebas Unitarias:** Pruebas de funciones matemáticas, lógicas de negocio y formateo sin dependencias externas (usando mocks).
2. **Pruebas de Integración:** Pruebas contra base de datos en contenedor temporal para verificar queries y migraciones.
3. **Auditoría de Seguridad:** Verificación de inyección SQL, CORS, sanitización de inputs y validación de autenticación (JWT/Bearer).

---

## 4. ESTRUCTURA ESTÁNDAR DE CARPETAS (ARQUITECTURA LIMPIA)

Todo proyecto desarrollado debe respetar estrictamente esta jerarquía de archivos:

\`\`\`text
nombre-del-proyecto/
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── README.md
├── src/
│   ├── core/
│   ├── domain/
│   ├── infrastructure/
│   ├── services/
│   └── api/
└── tests/
\`\`\`

---

## 5. FORMATO DE VALIDACIÓN DE ENTRADA Y SALIDA (CONTRATOS ESTRICTOS)

Toda interacción de datos debe implementar esquemas de validación dual:
1. **Entrada al Sistema (DTO Request):** Validada antes de llegar a la lógica de negocio.
2. **Salida de la IA (AI Response Contract):** Respuestas en formato JSON estructurado rígido.

---

## 6. PROTOCOLO DE INICIO (PROMPT DE ACTIVACIÓN PARA CUALQUIER IA)

"Actúa como un Arquitecto de Software Principal e Ingeniero Full Stack Senior.
Nos regiremos estrictamente por el 'STANDARD OPERATING PROCEDURE (AI-SDLC)'.
No generes código monolítico de golpe.
Vamos a desarrollar el siguiente software: [DESCRIBIR IDEA / PROYECTO AQUÍ].

Comienza ejecutando ÚNICAMENTE la FASE 1: ESPECIFICACIÓN TÉCNICA Y REQUERIMIENTOS.
Presenta la descomposición del sistema, entidades y contratos propuestos para mi aprobación antes de continuar."`;

export function generateSoftwarePrompt(softwareIdea: string): string {
  const idea = softwareIdea.trim() || '[aqui ira la idea]';
  return `Actúa como un Arquitecto de Software Principal e Ingeniero Full Stack Senior.
Nos regiremos estrictamente por el 'STANDARD OPERATING PROCEDURE (AI-SDLC)'.
No generes código monolítico de golpe.
Vamos a desarrollar el siguiente software: ${idea}

Comienza ejecutando ÚNICAMENTE la FASE 1: ESPECIFICACIÓN TÉCNICA Y REQUERIMIENTOS.
Presenta la descomposición del sistema, entidades y contratos propuestos para mi aprobación antes de continuar.

${SOP_AI_SDLC_BODY}`;
}

export const AiProjectCreationModal: React.FC<AiProjectCreationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [prompt, setPrompt] = useState('');
  const [softwareIdeaInput, setSoftwareIdeaInput] = useState('');
  const [isSoftwareMode, setIsSoftwareMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const softwareInputRef = useRef<HTMLInputElement>(null);

  // Activar modo Idea (Software)
  const handleSelectIdeaSoftware = () => {
    setIsSoftwareMode(true);
    const initialIdea = softwareIdeaInput.trim() || 'Sistema SaaS de Gestión Integral';
    setSoftwareIdeaInput(initialIdea);
    setPrompt(generateSoftwarePrompt(initialIdea));
    setError(null);
  };

  // Cuando el usuario edita la idea específica en modo software
  const handleSoftwareIdeaChange = (newIdea: string) => {
    setSoftwareIdeaInput(newIdea);
    setPrompt(generateSoftwarePrompt(newIdea));
  };

  // Desactivar modo software y volver a prompt libre
  const handleResetToStandard = () => {
    setIsSoftwareMode(false);
    setPrompt('');
    setSoftwareIdeaInput('');
  };

  useEffect(() => {
    if (isSoftwareMode && softwareInputRef.current) {
      softwareInputRef.current.focus();
      softwareInputRef.current.select();
    }
  }, [isSoftwareMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 10) {
      setError('Por favor introduce tu idea de software o alcance del proyecto.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      await onGenerate(prompt.trim());
      setPrompt('');
      setSoftwareIdeaInput('');
      setIsSoftwareMode(false);
      onClose();
    } catch (err: any) {
      setError(
        err.message ||
          'Error al invocar al Agente Organizador IA. Verifica que el backend esté en línea y conectado con Gemini.'
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
      subtitle="Estructura tableros completos por fases a partir de ideas o especificaciones de software"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Botón Destacado: Idea (Software) */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">Plantilla Oficial AI-SDLC</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                  Arquitectura
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Aplica el estándar de 5 fases para desarrollo riguroso de software.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSelectIdeaSoftware}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isSoftwareMode
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-cyan-500/30'
                : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-indigo-500/20'
            }`}
          >
            {isSoftwareMode ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Idea (Software) Activo</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5" />
                <span>Idea (Software)</span>
              </>
            )}
          </button>
        </div>

        {/* Campo de Idea cuando Modo Software está activo */}
        {isSoftwareMode ? (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>¿Cuál es el software que vamos a desarrollar? *</span>
              </label>
              <button
                type="button"
                onClick={handleResetToStandard}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Volver a modo libre
              </button>
            </div>

            <input
              ref={softwareInputRef}
              type="text"
              value={softwareIdeaInput}
              onChange={(e) => handleSoftwareIdeaChange(e.target.value)}
              placeholder="Ej: Plataforma de telemedicina con videollamadas WebRTC, recetas digitales y pagos en línea"
              disabled={isGenerating}
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Contexto inyectado automáticamente al Agente (AI-SDLC):</span>
                <span className="text-emerald-400 font-mono">5 Fases Estándar Incluidas</span>
              </div>
              <textarea
                rows={7}
                readOnly
                value={prompt}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-300 font-mono resize-none focus:outline-none cursor-default selection:bg-cyan-500 selection:text-slate-950"
              />
            </div>
          </div>
        ) : (
          /* Campo Normal de Entrada */
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Notas o alcance en bruto del proyecto *</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Structured Outputs / Fases Automáticas
              </span>
            </label>
            <textarea
              rows={6}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="Escribe tu idea de proyecto libremente, o pulsa arriba el botón 'Idea (Software)' para cargar la plantilla de ingeniería AI-SDLC..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all leading-relaxed"
            />
          </div>
        )}

        {/* Estado de generación activa */}
        {isGenerating && (
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-3 animate-pulse">
            <Bot className="w-5 h-5 text-cyan-400 animate-spin flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">
                {isSoftwareMode
                  ? 'Estructurando arquitectura de software bajo el estándar AI-SDLC...'
                  : 'Descomponiendo ideas con Structured Outputs...'}
              </p>
              <p className="text-slate-400 text-[11px]">
                Generando tareas ordenadas, prioridades, fechas estimadas y fases técnicas en tu tablero.
              </p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
            {isGenerating
              ? 'Estructurando con IA...'
              : isSoftwareMode
              ? 'Generar Proyecto AI-SDLC'
              : 'Generar Proyecto con IA'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
