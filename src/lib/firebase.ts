// Firebase configuration for EchoLove
// Get your config from: https://console.firebase.google.com/project/YOUR_PROJECT/settings/general

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase only if not already initialized
let app;
let auth: Auth;
let googleProvider: GoogleAuthProvider;
let firestore: Firestore;

try {
    if (firebaseConfig.apiKey) {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        firestore = getFirestore(app);
    } else {
        console.warn("Firebase config missing. Using mock/disabled state.");
        // Provide minimal mocks to satisfy build export requirements
        app = {} as any;
        auth = {} as Auth;
        googleProvider = new GoogleAuthProvider();
        firestore = {} as Firestore;
    }
} catch (e) {
    console.error("Firebase initialization failed:", e);
    app = {} as any;
    auth = {} as Auth;
    firestore = {} as Firestore;
    googleProvider = new GoogleAuthProvider();
}

export { auth, googleProvider, firestore };

export default app;
