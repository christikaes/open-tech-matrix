import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDcrUsGhuKytJQp8lNYImAaXYxbnuUsGAs",
  authDomain: "open-tech-radar.firebaseapp.com",
  databaseURL: "https://open-tech-radar-default-rtdb.firebaseio.com",
  projectId: "open-tech-radar",
  storageBucket: "open-tech-radar.firebasestorage.app",
  messagingSenderId: "547271356378",
  appId: "1:547271356378:web:dbca9f04f2346558659ae3",
  measurementId: "G-MJJ14EG62P"
};

let app: FirebaseApp;
let db: Firestore;

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
}

export { db };
