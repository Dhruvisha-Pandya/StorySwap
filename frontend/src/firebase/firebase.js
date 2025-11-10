import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// eslint-disable-next-line no-unused-vars
import { getFirestore, GeoPoint, serverTimestamp } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBLRLNliWpqR0CLpXUA4y6ta8iuiGOiJck",
  authDomain: "storyswap-cde54.firebaseapp.com",
  projectId: "storyswap-cde54",
  storageBucket: "storyswap-cde54.firebasestorage.app",
  messagingSenderId: "248636588803",
  appId: "1:248636588803:web:6c6f7f821f3eed0e1c5f36",
  measurementId: "G-HF5DBK96PM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);       // For authentication
export const db = getFirestore(app);    // For Firestore database
export { GeoPoint, serverTimestamp } from "firebase/firestore";  
export const storage = getStorage(app);