import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTPWb1C9Er4jI3PiQHmK6EApsLrYKV8pQ",
  authDomain: "synergiaproj.firebaseapp.com",
  projectId: "synergiaproj",
  storageBucket: "synergiaproj.firebasestorage.app",
  messagingSenderId: "320698300442",
  appId: "1:320698300442:web:74db7ab547b494dd00b9a3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);