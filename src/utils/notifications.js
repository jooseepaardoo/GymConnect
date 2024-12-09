import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const VAPID_KEY = 'TU_VAPID_KEY'; // Reemplazar con tu VAPID key de Firebase

export const initializeNotifications = async (userId) => {
  try {
    const messaging = getMessaging();
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      // Guardar el token en Firestore
      await updateDoc(doc(db, 'users', userId), {
        notificationToken: token,
        notificationsEnabled: true,
      });

      // Configurar el manejador de mensajes
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification;
        showNotification(title, body);
      });

      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error al inicializar notificaciones:', error);
    return false;
  }
};

export const showNotification = (title, body) => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
    });
  }
};

export const sendNotification = async (userId, notification) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (!userData.notificationsEnabled || !userData.notificationToken) {
      return;
    }

    // Guardar la notificación en Firestore
    await addDoc(collection(db, 'notifications'), {
      userId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      read: false,
      createdAt: serverTimestamp(),
    });

    // En una implementación real, aquí enviaríamos la notificación a través de
    // Firebase Cloud Functions o un servidor backend
  } catch (error) {
    console.error('Error al enviar notificación:', error);
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
  }
};

export const getUnreadNotificationsCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error al obtener conteo de notificaciones:', error);
    return 0;
  }
};