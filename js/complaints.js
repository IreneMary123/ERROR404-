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

/* Submit complaint */
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
    // Clear input fields
    document.getElementById("title").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("cat").value = "";

    // Reload complaints list
    loadComplaints();

  } catch (error) {
    console.error(error);
    alert("Error submitting complaint: " + error.message);
  }
}

/* Load all complaints */
export async function loadComplaints() {
  const q = query(collection(db, "complaints"), orderBy("votes", "desc"));
  const snapshot = await getDocs(q);

  const container = document.getElementById("complaintList");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    container.innerHTML += `
      <div class="card">
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <p>Category: ${data.category}</p>
        <p>Status: ${data.status}</p>
        <button onclick="upvote('${docSnap.id}')">👍 ${data.votes}</button>
      </div>
    `;
  });
}

/* Upvote complaint */
export async function upvote(id) {
  const ref = doc(db, "complaints", id);
  await updateDoc(ref, { votes: increment(1) });
  loadComplaints();
}

// Make functions global so HTML can access
window.submitComplaint = submitComplaint;
window.loadComplaints = loadComplaints;
window.upvote = upvote;