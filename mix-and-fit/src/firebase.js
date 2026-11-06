import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_pJeOHIOEnKXRvipZxJTQbqbXUXjZQ5Y",

  authDomain: "mix-and-fit.firebaseapp.com",

  projectId: "mix-and-fit",

  storageBucket: "mix-and-fit.firebasestorage.app",

  messagingSenderId: "153892822689",

  appId: "1:153892822689:web:428dce9c58c662a99b9ae0"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);