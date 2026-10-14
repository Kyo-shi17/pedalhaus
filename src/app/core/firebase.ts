import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
   apiKey: "AIzaSyBEa24b1k1ENLsASj-UF4AT02I_FWKHJ50",
  authDomain: "pedalhaus-bike-shop.firebaseapp.com",
  projectId: "pedalhaus-bike-shop",
  storageBucket: "pedalhaus-bike-shop.firebasestorage.app",
  messagingSenderId: "298045369218",
  appId: "1:298045369218:web:7c163a58e15bc489f97d9b"
};

/**
 * The Firebase app, Auth and Firestore instances are created lazily and only
 * once. Importing this module (for example from a service that a unit test
 * instantiates) must not touch the network or require a valid environment, so
 * the SDK is only initialised the first time `auth`/`db` is actually read.
 */
let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = getApps().length
      ? getApps()[0]
      : initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }

  return authInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }

  return firestoreInstance;
}

