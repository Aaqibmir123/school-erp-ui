import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVUxdk3pf5WF_nO5uRkG6ZpYnF6pPpirI",
  authDomain: "school-erp-b13bb.firebaseapp.com",
  projectId: "school-erp-b13bb",
  storageBucket: "school-erp-b13bb.firebasestorage.app",
  messagingSenderId: "634766663368",
  appId: "1:634766663368:web:d8966efb782d6f7d368ffd",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

auth.useDeviceLanguage();

export { app, auth, firebaseConfig };
