import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { showNotification } from '../utils/notifications';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const notification = {
          id: doc.id,
          ...doc.data(),
        };
        notificationsList.push(notification);
        
        if (!notification.read) {
          unread++;
          // Mostrar notificación del sistema si es nueva
          if (doc.metadata.hasPendingWrites) {
            showNotification(
              notification.title,
              notification.body
            );
          }
        }
      });

      setNotifications(notificationsList);
      setUnreadCount(unread);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
  };
};