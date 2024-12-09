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

## Tecnologías utilizadas

- React.js
- Firebase (Auth, Firestore, Storage, Analytics)
- Redux Toolkit
- Tailwind CSS
- React Router
- Headless UI
- Material UI Icons

## Requisitos previos

- Node.js >= 14.x
- NPM >= 6.x

## Instalación

1. Clona el repositorio:
\`\`\`bash
git clone https://github.com/jooseepaardoo/GymConnect.git
cd gymconnect
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Crea un archivo .env en la raíz del proyecto y configura las variables de entorno necesarias:
\`\`\`env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
\`\`\`

4. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

## Scripts disponibles

- \`npm run dev\`: Inicia el servidor de desarrollo
- \`npm run build\`: Crea una versión optimizada para producción
- \`npm run preview\`: Previsualiza la versión de producción localmente
- \`npm run lint\`: Ejecuta el linter para verificar el código

## Estructura del proyecto

\`\`\`
gymconnect/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── layouts/       # Layouts reutilizables
│   ├── store/         # Configuración y slices de Redux
│   ├── hooks/         # Hooks personalizados
│   ├── utils/         # Utilidades y funciones auxiliares
│   ├── firebase/      # Configuración de Firebase
│   ├── styles/        # Estilos globales y utilidades CSS
│   └── assets/        # Imágenes y otros recursos estáticos
├── public/            # Archivos públicos
└── firebase/          # Configuración y reglas de Firebase
\`\`\`

## Seguridad

- Validación de datos en el cliente y servidor
- Reglas de seguridad en Firestore y Storage
- Rate limiting para prevenir abusos
- Sanitización de datos
- Encriptación de mensajes
- Protección contra XSS y CSRF
- Autenticación y autorización robusta

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