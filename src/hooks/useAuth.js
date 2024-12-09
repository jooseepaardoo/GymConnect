import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { setUser, clearUser } from '../store/slices/authSlice';
import { trackEvent } from '../utils/analytics';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Obtener datos adicionales del usuario desde Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();

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