import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDa_Pe_2yOSXdQgW_yuNJdquM7DpqA2EMI",
  authDomain: "bengal-slot.firebaseapp.com",
  projectId: "bengal-slot",
  storageBucket: "bengal-slot.firebasestorage.app",
  messagingSenderId: "26934303928",
  appId: "1:26934303928:web:d3541f50ddbb50b0cea84d"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
