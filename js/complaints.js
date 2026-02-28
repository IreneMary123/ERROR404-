import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   Submit complaint
========================= */
export async function submitComplaint(uid, title, description, category) {
  if (!title || !description || !category) {
    alert("Please fill all fields!");
    return;
  }

  try {
    await addDoc(collection(db, "complaints"), {
      title,
      description,
      category,
      created_by: uid,
      votes: 0,
      impact_score: 0,
      status: "Pending",
      created_at: serverTimestamp()
    });

    alert("Complaint submitted successfully!");

    // clear fields if present
    const t = document.getElementById("title");
    const d = document.getElementById("desc");
    const c = document.getElementById("cat");

    if (t) t.value = "";
    if (d) d.value = "";
    if (c) c.value = "";

    loadComplaints();
  } catch (error) {
    console.error(error);
    alert("Error submitting complaint: " + error.message);
  }
}

/* =========================
   Load complaints (UPDATED UI)
========================= */
export async function loadComplaints() {
  const q = query(collection(db, "complaints"), orderBy("votes", "desc"));
  const snapshot = await getDocs(q);

  const container = document.getElementById("complaintList");
  if (!container) return;

  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    container.innerHTML += `
      <div class="card">
        <h3>${data.title || ""}</h3>
        <div class="meta">
          ${data.category || "General"} • ${data.status || "Pending"}
        </div>
        <p>${data.description || ""}</p>
        <button class="vote-btn" onclick="upvote('${docSnap.id}')">
          👍 ${data.votes || 0}
        </button>
      </div>
    `;
  });
}

/* =========================
   Upvote complaint
========================= */
export async function upvote(id) {
  const ref = doc(db, "complaints", id);
  await updateDoc(ref, { votes: increment(1) });
  loadComplaints();
}

/* =========================
   Make functions global
========================= */
window.submitComplaint = submitComplaint;
window.loadComplaints = loadComplaints;
window.upvote = upvote;