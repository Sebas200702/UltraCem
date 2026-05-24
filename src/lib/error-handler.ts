export const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: 'Los datos ingresados no son válidos. Por favor verifica e intenta de nuevo.',
  NOT_FOUND: 'No encontramos lo que buscabas. Intenta de nuevo.',
  RATE_LIMIT_EXCEEDED: 'Has superado el límite de consultas. Intenta en unos minutos.',
  CALCULATION_ERROR: 'Hubo un error calculando los materiales. Verifica las dimensiones.',
  NLP_ERROR: 'No pudimos entender tu mensaje. ¿Puedes reformularlo?',
  DATABASE_ERROR: 'Error de conexión. Intenta de nuevo en un momento.',
  EXTERNAL_API_ERROR: 'Servicio temporalmente no disponible. Intenta en unos segundos.',
};

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message?: string, statusCode?: number, details?: unknown) {
    super(message ?? errorMessages[code] ?? 'Error desconocido');
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode ?? 500;
    this.details = details;
  }
}

export function handleAPIError(error: unknown): { code: string; message: string; statusCode: number; details?: unknown } {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: errorMessages[error.code] ?? error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  console.error(error);

  const isDev = process.env.NODE_ENV === 'development';

  return {
    code: 'INTERNAL_ERROR',
    message: 'Error interno del servidor. Intenta de nuevo más tarde.',
    statusCode: 500,
    ...(isDev ? { details: String(error) } : {}),
  };
}
