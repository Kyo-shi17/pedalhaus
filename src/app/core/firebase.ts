import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4kt9vmYp1yi0vnq-qSkHlX6b7VPg3RZE",
  authDomain: "reyes-bike-management.firebaseapp.com",
  projectId: "reyes-bike-management",
  storageBucket: "reyes-bike-management.firebasestorage.app",
  messagingSenderId: "553179998449",
  appId: "1:553179998449:web:b2535e1ce8c79471d52150"
};

/**
 * The Firebase app, Auth and Firestore instances are created lazily and only
 * once. Importing this module (for example from a service that a unit test
 * instantiates) must not touch the network or require a valid environment, so
 * the SDK is only initialised the first time `auth`/`db` is actually read.
 */
let firebaseApp: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = getApps().length
      ? getApps()[0]
      : initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }

  return firestoreInstance;
}
