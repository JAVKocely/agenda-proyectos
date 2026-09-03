function getBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  let url = envUrl || 'https://agenda-ia-backend.onrender.com/api/v1';
  url = url.replace(/\/+$/, ''); // eliminar barras finales
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
}

const API_BASE_URL = getBaseUrl();

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getActiveUserId(): string {
  return localStorage.getItem('mml_active_user') || 'meli';
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': getActiveUserId(),
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      let errorData = null;

      try {
        errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback a texto plano si no es JSON
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Reintentar automáticamente en caso de error de red (p. ej. si Render está despertando)
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, 1200));
      return request<T>(endpoint, options, retries - 1);
    }
    throw new ApiError(
      'No se pudo conectar con el servidor en la nube. Por favor intenta de nuevo en unos segundos.',
      0
    );
  }
}
