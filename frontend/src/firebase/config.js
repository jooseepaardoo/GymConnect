import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// NOTA: Estas credenciales son públicas y solo permiten autenticación
// Todas las operaciones sensibles se realizan en el backend
const firebaseConfig = {
  apiKey: "AIzaSyCEMa0RWuJcT_VHI24gWBTCMHgZpV30F7s",
  authDomain: "gymconnect-70425.firebaseapp.com",
  projectId: "gymconnect-70425"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;