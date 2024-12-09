import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const getCurrentUser = () => {
  const auth = getAuth();
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }
    return userDoc.data();
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
};

export const sanitizeUserData = (userData) => {
  const allowedFields = [
    'name',
    'email',
    'photoURL',
    'objectives',
    'experience',
    'location',
    'preferredTime',
    'createdAt',
    'lastActive',
  ];

  return Object.keys(userData).reduce((acc, key) => {
    if (allowedFields.includes(key)) {
      acc[key] = typeof userData[key] === 'string' 
        ? userData[key].trim() 
        : userData[key];
    }
    return acc;
  }, {});
};

export const validateUserPermissions = async (userId, targetUserId) => {
  if (!userId || !targetUserId) {
    throw new Error('ID de usuario no proporcionado');
  }

  if (userId === targetUserId) {
    return true;
  }

  // Verificar si los usuarios tienen un match
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef,
    where('users', 'array-contains', userId),
    where('users', 'array-contains', targetUserId)
  );

  const matchSnapshot = await getDocs(q);
  return !matchSnapshot.empty;
};

export const rateLimit = (() => {
  const limits = new Map();

  return (userId, action, limit = 10, windowMs = 60000) => {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const userLimits = limits.get(key) || [];

    // Limpiar registros antiguos
    const validRecords = userLimits.filter(
      timestamp => now - timestamp < windowMs
    );

    if (validRecords.length >= limit) {
      throw new Error('Has excedido el límite de intentos. Por favor, espera un momento.');
    }

    validRecords.push(now);
    limits.set(key, validRecords);

    // Programar limpieza después de la ventana de tiempo
    setTimeout(() => {
      const records = limits.get(key) || [];
      const newRecords = records.filter(
        timestamp => now - timestamp < windowMs
      );
      if (newRecords.length === 0) {
        limits.delete(key);
      } else {
        limits.set(key, newRecords);
      }
    }, windowMs);

    return true;
  };
})();

export const encryptMessage = (message) => {
  // En una implementación real, usaríamos una biblioteca de cifrado como crypto-js
  // Por ahora, solo codificamos en base64 como ejemplo
  return btoa(message);
};

export const decryptMessage = (encryptedMessage) => {
  // En una implementación real, usaríamos una biblioteca de cifrado como crypto-js
  // Por ahora, solo decodificamos de base64 como ejemplo
  return atob(encryptedMessage);
};