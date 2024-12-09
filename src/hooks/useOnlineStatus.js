import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useOnlineStatus = (userId) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!userId) return;

    const updateOnlineStatus = async (status) => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          online: status,
          lastActive: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error al actualizar estado online:', error);
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      updateOnlineStatus(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateOnlineStatus(false);
    };

    // Actualizar estado inicial
    updateOnlineStatus(navigator.onLine);

    // Configurar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Actualizar lastActive periódicamente mientras el usuario está online
    let interval;
    if (navigator.onLine) {
      interval = setInterval(() => {
        updateOnlineStatus(true);
      }, 5 * 60 * 1000); // Cada 5 minutos
    }

    // Actualizar lastActive cuando el usuario cierra/recarga la página
    window.addEventListener('beforeunload', () => {
      updateOnlineStatus(false);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (interval) clearInterval(interval);
      updateOnlineStatus(false);
    };
  }, [userId]);

  return isOnline;
};