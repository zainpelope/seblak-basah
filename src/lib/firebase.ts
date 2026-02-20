// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBNbCoeMG926xsIdi5g-38iBPPplppttCc",
    authDomain: "seblak-basah.firebaseapp.com",
    projectId: "seblak-basah",
    storageBucket: "seblak-basah.firebasestorage.app",
    messagingSenderId: "468390288349",
    appId: "1:468390288349:web:ce160a08f5788a1c20f434",
    measurementId: "G-M0GSY334KN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let analytics;

// Only initialize analytics on the client side
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

const db = getFirestore(app);

export { app, analytics, db };
