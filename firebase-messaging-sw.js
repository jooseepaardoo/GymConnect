importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCEMa0RWuJcT_VHI24gWBTCMHgZpV30F7s",
  authDomain: "gymconnect-70425.firebaseapp.com",
  projectId: "gymconnect-70425",
  storageBucket: "gymconnect-70425.firebasestorage.app",
  messagingSenderId: "970451269865",
  appId: "1:970451269865:web:952f0fade0f07c6a625878",
  measurementId: "G-6KEKE3Q2WK"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manejo de mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL('/chat', self.location.origin).href;

  const promiseChain = clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      // Buscar si ya hay una ventana abierta
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
});