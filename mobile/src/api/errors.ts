import { isAxiosError } from 'axios';

// Error de la API listo para mostrar en pantalla.
export interface ApiError {
  status: number | null;
  // Mensaje general.
  message: string;
  // Primer error de cada campo (validaciones 422 de Laravel).
  fieldErrors: Record<string, string>;
}

interface LaravelErrorBody {
  message?: string;
  errors?: Record<string, string[] | string>;
}

export function parseApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return { status: null, message: 'Ocurrió un error inesperado.', fieldErrors: {} };
  }

  if (!error.response) {
    return {
      status: null,
      message: 'No se pudo conectar con el servidor. Revisá que la API esté levantada y que la URL sea correcta.',
      fieldErrors: {},
    };
  }

  const { status } = error.response;
  const body = (error.response.data ?? {}) as LaravelErrorBody;

  const fieldErrors: Record<string, string> = {};
  for (const [campo, mensajes] of Object.entries(body.errors ?? {})) {
    fieldErrors[campo] = Array.isArray(mensajes) ? mensajes[0] : String(mensajes);
  }

  let message = body.message ?? 'Ocurrió un error inesperado.';
  if (status === 422 && Object.keys(fieldErrors).length > 1) {
    message = 'Revisá los datos marcados.';
  } else if (status === 403 && !body.message) {
    message = 'No tenés permiso para realizar esta acción.';
  } else if (status === 404) {
    message = 'No se encontró lo que buscabas.';
  } else if (status === 429) {
    message = 'Demasiados intentos. Esperá un minuto y probá de nuevo.';
  } else if (status >= 500) {
    message = 'Error del servidor. Intentá de nuevo en unos minutos.';
  }

  return { status, message, fieldErrors };
}
