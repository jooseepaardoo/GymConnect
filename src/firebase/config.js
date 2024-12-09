import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCEMa0RWuJcT_VHI24gWBTCMHgZpV30F7s",
  authDomain: "gymconnect-70425.firebaseapp.com",
  projectId: "gymconnect-70425",
  storageBucket: "gymconnect-70425.firebasestorage.app",
  messagingSenderId: "970451269865",
  appId: "1:970451269865:web:952f0fade0f07c6a625878",
  measurementId: "G-6KEKE3Q2WK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;