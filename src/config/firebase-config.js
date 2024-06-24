// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3L2yYcFWDlMGxd1F__TU1AubUEHXCbJc",
  authDomain: "lending-buddha-4fa78.firebaseapp.com",
  projectId: "lending-buddha-4fa78",
  storageBucket: "lending-buddha-4fa78.appspot.com",
  messagingSenderId: "813483657208",
  appId: "1:813483657208:web:832bb927f9a6988c61780d",
  measurementId: "G-PGHGDV05NE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export {auth};