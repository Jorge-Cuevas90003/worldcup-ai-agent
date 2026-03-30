import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDNcH-NXkGY1OTvPulj47Ip27nn94jX-1Y',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'worldcup-agent.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'worldcup-agent',
  storageBucket: 'worldcup-agent.firebasestorage.app',
  messagingSenderId: '458593253698',
  appId: '1:458593253698:web:e752a5ebc72e2a17fbf0db',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
