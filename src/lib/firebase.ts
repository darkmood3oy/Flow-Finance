import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromCache } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Validate Connection to Firestore (Skill Requirement)
async function testConnection() {
  try {
    // Attempting to read a non-existent doc from server to verify connection/rules configuration
    // We use getDocFromCache or a simple getDoc to trigger a check
    const { getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, '_connection_test', 'startup'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('permission'))) {
      console.warn("Firebase Connection Warning:", error.message);
    }
  }
}
testConnection();
