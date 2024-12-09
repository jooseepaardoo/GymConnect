export class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}

export const handleFirebaseError = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/invalid-email': 'El correo electrónico no es válido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña es demasiado débil',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor, intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu conexión a internet',
    'storage/unauthorized': 'No tienes permiso para realizar esta acción',
    'storage/canceled': 'Operación cancelada',
    'storage/unknown': 'Error desconocido al subir el archivo',
  };

  return errorMessages[error.code] || 'Ha ocurrido un error inesperado';
};

export const logError = (error, context = {}) => {
  // En producción, aquí enviaríamos los errores a un servicio de monitoreo
  // como Sentry, LogRocket, etc.
  console.error('Error:', {
    message: error.message,
    code: error.code,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const handleApiError = (error) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  if (error.code && error.code.startsWith('auth/')) {
    return {
      message: handleFirebaseError(error),
      code: error.code,
    };
  }

  return {
    message: 'Ha ocurrido un error inesperado',
    code: 'UNKNOWN_ERROR',
  };
};