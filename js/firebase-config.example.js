// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBI9yc2IrLQ_S5KW_doGtXNWX1883un_lw",
  authDomain: "my-site-92874.firebaseapp.com",
  projectId: "my-site-92874",
  storageBucket: "my-site-92874.firebasestorage.app",
  messagingSenderId: "575232040342",
  appId: "1:575232040342:web:e4ce6274f43ba320a211b7",
  measurementId: "G-6CC0FXCQN1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
