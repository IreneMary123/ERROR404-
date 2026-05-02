import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

/* ── Styled Error Popup ── */
function showAuthPopup(message, type = 'error') {
  // Remove any existing popup
  const existing = document.getElementById('authPopup');
  if (existing) existing.remove();

  const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
  const bgColor = type === 'error'
    ? 'linear-gradient(135deg, #ff7675, #d63031)'
    : type === 'warning'
      ? 'linear-gradient(135deg, #fdcb6e, #e17055)'
      : 'linear-gradient(135deg, #00b894, #00a884)';

  const popup = document.createElement('div');
  popup.id = 'authPopup';
  popup.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease;
    " onclick="this.parentElement.remove()">
      <div style="
        background: #fff;
        border-radius: 20px;
        padding: 36px 32px 28px;
        width: 380px;
        max-width: 90%;
        box-shadow: 0 24px 48px rgba(0,0,0,0.15);
        animation: modalSlideIn 0.3s ease;
        text-align: center;
      " onclick="event.stopPropagation()">
        <div style="
          width: 64px;
          height: 64px;
          background: ${bgColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          font-size: 28px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          animation: logoFloat 2s ease-in-out infinite;
        ">${icon}</div>
        <h3 style="
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
          font-family: 'Inter', sans-serif;
        ">${type === 'error' ? 'Oops!' : type === 'warning' ? 'Hold on!' : 'Success!'}</h3>
        <p style="
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
          line-height: 1.6;
          font-family: 'Inter', sans-serif;
        ">${message}</p>
        <button onclick="this.closest('#authPopup').remove()" style="
          padding: 10px 32px;
          background: #6c5ce7;
          color: white;
          border: none;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 8px rgba(108,92,231,0.3);
          transition: all 0.2s ease;
        " onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 16px rgba(108,92,231,0.4)'" 
           onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(108,92,231,0.3)'"
        >Got it</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    if (document.getElementById('authPopup')) {
      popup.remove();
    }
  }, 6000);
}

/* ── Friendly Error Messages ── */
function getFriendlyError(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'That email address does not look right. Please check and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact your administrator.';
    case 'auth/user-not-found':
      return 'No account found with that email. Would you like to register instead?';
    case 'auth/wrong-password':
      return 'Incorrect password. Please check your password and try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please double-check your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. Contact your administrator.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/* ── Register ── */
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = registerForm.querySelector("input[type=email]").value.trim();
  const password = registerForm.querySelector("input[type=password]").value;
  const role = document.getElementById("selectedRole").value;

  if (!email.endsWith("@mgits.ac.in")) {
    showAuthPopup("Only @mgits.ac.in email addresses are allowed.", "error");
    return;
  }

  // Students must start with a number
  if (role === "Student" && !/^\d/.test(email)) {
    showAuthPopup("Invalid email ID. Please use your valid college student email.", "error");
    return;
  }

  // If somehow role is Admin/Faculty — check allowedAdmins whitelist
  if (role === "Faculty" || role === "Admin") {
    try {
      const allowedDoc = await getDoc(doc(db, "allowedAdmins", email));
      if (!allowedDoc.exists()) {
        showAuthPopup("You are not authorized to register as an admin. Contact the existing admin.", "error");
        return;
      }
    } catch (err) {
      showAuthPopup("Could not verify admin authorization. Please try again.", "error");
      return;
    }
  }

  try {
    const btn = registerForm.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Creating account…";

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Derive a display name from email
    const username = email.split("@")[0];

    // Determine final role
    const finalRole = (role === "Faculty" || role === "Admin") ? "Admin" : "Student";

    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      username,
      role: finalRole,
      created_at: new Date().toISOString()
    });

    window.location.href = finalRole === "Admin" ? "admin.html" : "dashboard.html";
  } catch (err) {
    showAuthPopup(getFriendlyError(err.code), "error");
    const btn = registerForm.querySelector("button");
    btn.disabled = false;
    btn.textContent = "Sign Up";
  }
});

/* ── Login ── */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginForm.querySelector("input[type=email]").value.trim();
  const password = loginForm.querySelector("input[type=password]").value;
  const role = document.getElementById("selectedRole").value;

  // Validate email format on login
  if (!email.endsWith("@mgits.ac.in")) {
    showAuthPopup("Invalid email ID. Please use your valid college email.", "error");
    return;
  }

  if (role === "Student" && !/^\d/.test(email)) {
    showAuthPopup("Invalid email ID. Please use your valid college email.", "error");
    return;
  }

  try {
    const btn = loginForm.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Signing in…";

    await signInWithEmailAndPassword(auth, email, password);

    // Fetch user doc to route properly
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (userDoc.exists() && (userDoc.data().role === "Admin" || userDoc.data().role === "Faculty")) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (err) {
    showAuthPopup(getFriendlyError(err.code), "error");
    const btn = loginForm.querySelector("button");
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
});

/* ── Logout (global) ── */
window.logoutUser = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};