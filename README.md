# GymConnect

GymConnect es una aplicación web que ayuda a las personas a encontrar compañeros de gimnasio (gymbros o gymsis) con quienes puedan entrenar.

## Características principales

- Sistema de registro y autenticación con email y Google
- Perfiles de usuario personalizables
- Sistema de matching estilo Tinder
- Chat en tiempo real entre usuarios que han hecho match
- Geolocalización para encontrar usuarios cercanos
- Notificaciones en tiempo real
- Diseño responsive y moderno
- Backend y Frontend separados para mayor seguridad

## Tecnologías utilizadas

### Frontend
- React.js
- Firebase (solo Auth)
- Redux Toolkit
- Tailwind CSS
- React Router
- Headless UI
- Material UI Icons

### Backend
- Node.js
- Express
- Firebase Admin SDK
- CORS

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

```
GymConnect/
├── backend/           # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/   # Configuración (Firebase, etc.)
│   │   ├── routes/   # Rutas de la API
│   │   ├── middleware/ # Middlewares (auth, etc.)
│   │   └── index.js  # Punto de entrada
│   └── package.json
│
└── frontend/         # Cliente React + Vite
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/ # Servicios API
    │   ├── store/    # Estado global (Redux)
    │   └── main.jsx
    └── package.json
```

## Requisitos previos

- Node.js >= 14.x
- NPM >= 6.x

## Configuración

1. Backend:
   ```bash
   cd backend
   cp .env.example .env
   # Editar .env con las credenciales de Firebase Admin SDK
   npm install
   npm run dev
   ```

2. Frontend:
   ```bash
   cd frontend
   cp .env.example .env
   # Editar .env con las variables de entorno necesarias
   npm install
   npm run dev
   ```

## Variables de Entorno

### Backend (.env)
```
PORT=5000
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Seguridad

- El frontend no tiene acceso directo a Firebase Firestore o Storage
- Todas las operaciones de base de datos pasan por el backend
- El backend verifica los tokens de Firebase antes de permitir el acceso
- Las credenciales sensibles están protegidas en el backend
- CORS está configurado para permitir solo orígenes específicos
- Validación de datos en el cliente y servidor
- Rate limiting para prevenir abusos
- Sanitización de datos
- Encriptación de mensajes
- Protección contra XSS y CSRF
- Autenticación y autorización robusta

## Desarrollo

1. El backend maneja toda la lógica de negocio y el acceso a Firebase
2. El frontend solo maneja la autenticación con Firebase y se comunica con el backend a través de la API
3. Todas las operaciones de base de datos se realizan a través del backend
4. El frontend usa un servicio API centralizado para todas las llamadas al backend

## Contribuir

1. Haz fork del repositorio
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Haz commit de tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Jose Pardo - jooseepaardoo@gmail.com

Link del proyecto: [https://github.com/jooseepaardoo/GymConnect](https://github.com/jooseepaardoo/GymConnect)