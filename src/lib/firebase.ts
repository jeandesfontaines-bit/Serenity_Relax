import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVKma95UOoUSajrzCmV7vLHPAt2Q5tK7c",
  authDomain: "serenity-relax-joao.firebaseapp.com",
  projectId: "serenity-relax-joao",
  storageBucket: "serenity-relax-joao.firebasestorage.app",
  messagingSenderId: "188673755819",
  appId: "1:188673755819:web:4a4d2cd7a48446600505ee"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
