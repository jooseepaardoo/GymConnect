export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'El correo electrónico es requerido';
  if (!emailRegex.test(email)) return 'El correo electrónico no es válido';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe contener al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'La contraseña debe contener al menos una minúscula';
  if (!/[0-9]/.test(password)) return 'La contraseña debe contener al menos un número';
  if (!/[!@#$%^&*]/.test(password)) return 'La contraseña debe contener al menos un carácter especial (!@#$%^&*)';
  return null;
};

export const validateName = (name) => {
  if (!name) return 'El nombre es requerido';
  if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (name.length > 50) return 'El nombre no puede tener más de 50 caracteres';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return 'El nombre solo puede contener letras y espacios';
  return null;
};

export const validateLocation = (location) => {
  if (!location) return 'La ubicación es requerida';
  if (location.length < 3) return 'La ubicación debe tener al menos 3 caracteres';
  if (location.length > 100) return 'La ubicación no puede tener más de 100 caracteres';
  return null;
};

export const validateObjectives = (objectives) => {
  if (!objectives || objectives.length === 0) return 'Debes seleccionar al menos un objetivo';
  if (objectives.length > 3) return 'No puedes seleccionar más de 3 objetivos';
  return null;
};

export const validateExperience = (experience) => {
  const validExperiences = ['principiante', 'intermedio', 'avanzado'];
  if (!experience) return 'El nivel de experiencia es requerido';
  if (!validExperiences.includes(experience)) return 'Nivel de experiencia no válido';
  return null;
};

export const validatePreferredTime = (preferredTime) => {
  if (!preferredTime || preferredTime.length === 0) return 'Debes seleccionar al menos un horario preferido';
  return null;
};

export const validateImage = (file) => {
  if (!file) return null; // La imagen es opcional
  
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return 'El archivo debe ser una imagen (JPEG, PNG o WEBP)';
  }

  if (file.size > maxSize) {
    return 'La imagen no puede ser mayor a 5MB';
  }

  return null;
};