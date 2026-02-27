import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   REGISTER
========================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;

    // 🔒 Restrict to MGITS emails only
    if (!email.endsWith("@mgits.ac.in")) {
      alert("Registration allowed only for @mgits.ac.in email addresses.");
      return;
    }

    try {
      const userCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: email,
        role: "student"
      });

      alert("Account created successfully!");
      registerForm.reset();
    } catch (error) {
      alert(error.message);
    }
  });
}

/* =========================
   LOGIN
========================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      loginForm.reset();
    } catch (error) {
      alert(error.message);
    }
  });
}