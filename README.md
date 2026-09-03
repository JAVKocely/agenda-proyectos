# Agenda y Seguimiento de Proyectos con IA

Aplicación Full-Stack moderna para la gestión inteligente de proyectos y tareas con **descomposición asistida por IA** mediante llamadas directas a la API de LLMs con **Structured Outputs (JSON Schema estricto)**.

---

## 🌟 Características Principales

- **Dashboard Interactivo:**
  - Visualización en grid responsivo de tarjetas de proyectos con progreso en porcentaje.
  - Estados claros: `activo`, `pausado`, `completado` con filtros y contadores reactivos.
  - Fechas límite calculadas con indicador visual de días restantes o alerta de vencimiento.
  - Buscador en tiempo real por título y descripción.
  - Métricas globales en cabecera: proyectos activos, completados y avance global.

- **Vista Detalle de Proyecto:**
  - Panel completo con título, alcance y controles de cambio de estado rápido.
  - Desglose de tareas / fases ordenadas cronológicamente con badges de prioridad (`urgente`, `alta`, `media`, `baja`).
  - **Cálculo Reactivo de Avance:** Al marcar una tarea como completada, el porcentaje del proyecto y del dashboard se recalculan al instante con animaciones suaves.
  - Posibilidad de añadir nuevas tareas manualmente o eliminar fases existentes.
  - Inspección del texto bruto original (`raw_prompt`) que dio origen al proyecto.

- **Modal de Creación con Input Libre:**
  - Área de texto para ingresar ideas desestructuradas, notas sueltas o el alcance bruto del proyecto.
  - Botones de ideas predefinidas para pruebas con un solo clic.
  - Estado de carga con retroalimentación visual del proceso de estructuración.

- **Agente Organizador IA (API Directa + Structured Outputs):**
  - **Sin frameworks pesados ni intermediarios** (cero LangChain): llamadas directas vía el SDK oficial `google-genai` (Gemini) o HTTP REST (Groq Cloud).
  - **JSON Schema Estricto:** Se exige obligatoriamente la generación de:
    - `title`: Título formal y conciso del proyecto.
    - `description`: Resumen ejecutivo del alcance.
    - `estimated_completion_days`: Estimación en días para completar el proyecto.
    - `tasks`: Lista secuencial de tareas con `title`, `description`, `priority` y `order`.
  - Persistencia atómica en base de datos y apertura inmediata del proyecto generado en la interfaz.

---

## 🏗️ Arquitectura del Sistema (Clean Architecture)

```text
agenda-proyectos/
├── .env                          # Variables de entorno locales
├── .env.example                  # Plantilla de configuración
├── docker-compose.yml            # Orquestación con PostgreSQL 15
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint, middlewares y lifespan
│   │   ├── core/                 # Configuración Pydantic Settings y SQLAlchemy DB
│   │   ├── domain/               # Enums puros y entidades de negocio
│   │   ├── infrastructure/
│   │   │   ├── db/               # Modelos ORM e implementaciones de repositorios
│   │   │   └── ai/               # Clientes LLM directos, plantillas y esquemas JSON
│   │   ├── services/             # Casos de uso (ProjectService, AIPlannerService)
│   │   └── api/                  # Endpoints REST v1 y DTOs de validación
│   └── tests/                    # Suite de pruebas unitarias y de integración con Pytest
│
└── frontend/
    ├── src/
    │   ├── api/                  # Clientes HTTP hacia la API REST
    │   ├── types/                # Interfaces TypeScript de dominio y DTOs
    │   ├── components/
    │   │   ├── layout/           # Header y tarjetas estadísticas
    │   │   ├── dashboard/        # ProjectCard, ProjectGrid, FilterBar
    │   │   ├── detail/           # ProjectDetailHeader, TaskList, TaskItem
    │   │   ├── ai/               # Modal de creación libre con IA
    │   │   └── ui/               # Badge, ProgressBar, Button, Modal
    │   └── App.tsx               # Orquestación del estado global y vistas
    └── package.json
```

---

## 🚀 Guía de Instalación y Ejecución

### 1. Requisitos Previos
- **Python 3.11+**
- **Node.js 18+** y npm
- Clave de API para el Agente IA:
  - [Google AI Studio (Gemini API)](https://aistudio.google.com/) (Recomendado y gratuito)
  - o [Groq Cloud Console](https://console.groq.com/)

---

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo o edita el `.env` existente en la raíz:

```bash
cp .env.example .env
```

Abre `.env` y coloca tu API Key:

```env
# Proveedor por defecto: gemini
AI_PROVIDER=gemini
GEMINI_API_KEY=tu_clave_de_gemini_aqui
GEMINI_MODEL=gemini-2.5-flash
```

*(Opcional: Si deseas usar Groq, establece `AI_PROVIDER=groq`, `GROQ_API_KEY=tu_clave` y `GROQ_MODEL=llama-3.3-70b-versatile`)*.

---

### 3. Ejecutar el Backend

Desde la carpeta raíz del proyecto:

```bash
# 1. Acceder a la carpeta backend
cd backend

# 2. Activar el entorno virtual existente (.venv)
# En Windows (PowerShell):
.venv\Scripts\Activate.ps1
# En Linux/macOS:
# source .venv/bin/activate

# 3. (Opcional si deseas reinstalar dependencias)
pip install -r requirements.txt

# 4. Iniciar el servidor FastAPI con Uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- La API estará escuchando en: `http://localhost:8000`
- Documentación Swagger interactiva: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

### 4. Ejecutar el Frontend

En una terminal separada, desde la carpeta raíz:

```bash
# 1. Acceder a la carpeta frontend
cd frontend

# 2. Iniciar el servidor de desarrollo de Vite
npm run dev
```

- Abre tu navegador en: `http://localhost:5173`

---

### 5. Ejecutar la Suite de Pruebas (Backend)

Desde el directorio `backend` con el entorno virtual activo:

```bash
pytest -v
```

La suite valida:
- Validación estricta de JSON Schema con Pydantic v2 y rechazo de campos inválidos.
- Cálculo reactivo del porcentaje de progreso: \(0\% \to 50\% \to 100\%\).
- Creación, actualización y eliminación de proyectos y tareas en cascada.
- Orquestación del Agente Organizador IA con mocks deterministas.

---

## 🐳 Ejecución con Docker Compose (Opcional con PostgreSQL)

Si prefieres ejecutar el backend contra PostgreSQL 15 en contenedores:

```bash
docker-compose up --build
```
