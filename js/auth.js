import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const roleSelect = document.getElementById("roleSelect");

registerForm.addEventListener("submit", async(e)=>{
  e.preventDefault();
  const email = registerForm.querySelector("input[type=email]").value;
  const password = registerForm.querySelector("input[type=password]").value;
  const role = roleSelect.value;
  if(!email.endsWith("@mgits.ac.in")) return alert("Only @mgits.ac.in allowed");
  try{
    const userCredential = await createUserWithEmailAndPassword(auth,email,password);
    await setDoc(doc(db,"users",userCredential.user.uid),{email,role});
    window.location.href="dashboard.html";
  }catch(err){alert(err.message);}
});

loginForm.addEventListener("submit", async(e)=>{
  e.preventDefault();
  const email = loginForm.querySelector("input[type=email]").value;
  const password = loginForm.querySelector("input[type=password]").value;
  try{ await signInWithEmailAndPassword(auth,email,password); window.location.href="dashboard.html"; }
  catch(err){alert(err.message);}
});

window.logoutUser = async()=>{await signOut(auth); window.location.href="index.html";}