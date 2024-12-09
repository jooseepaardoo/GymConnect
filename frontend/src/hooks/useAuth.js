import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { setUser, clearUser } from '../store/slices/authSlice';
import { trackEvent } from '../utils/analytics';
import api from '../services/api';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Obtener datos del usuario desde el backend
          const userData = await api.get('/users/profile');

          dispatch(setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            ...userData,
          }));

          trackEvent('user_authenticated', {
            userId: user.uid,
            method: user.providerData[0]?.providerId || 'unknown',
          });
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        dispatch(clearUser());
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return { loading };
};