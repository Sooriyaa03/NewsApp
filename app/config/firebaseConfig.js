// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBKYgl52-dMY6jggZUvVcGtvmSqR3iX498",
    authDomain: "newsapp-1f622.firebaseapp.com",
    projectId: "newsapp-1f622",
    storageBucket: "newsapp-1f622.appspot.com",
    messagingSenderId: "6771446488",
    appId: "1:6771446488:android:e40a2c5da1836ccf843dad",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

const db = getFirestore(app);

export { auth , db};

