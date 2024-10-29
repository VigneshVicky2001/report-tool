import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHYsiQflLp3bCyGpHZ0NDGu6ERwNdSyBI",
  authDomain: "report-gen-2b3b0.firebaseapp.com",
  projectId: "report-gen-2b3b0",
  storageBucket: "report-gen-2b3b0.appspot.com",
  messagingSenderId: "893145789234",
  appId: "1:893145789234:web:53e8c2f6ea5f9a4db75d2b",
  measurementId: "G-TTVVF21DYB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();