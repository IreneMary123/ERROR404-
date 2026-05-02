import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.loadAdminData = async () => {
  const q = query(collection(db, "complaints"), orderBy("votes", "desc"));
  const snapshot = await getDocs(q);

  let total = 0, pending = 0, resolved = 0, highPriority = 0;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    total++;
    if (data.status === "Pending") pending++;
    if (data.status === "Resolved") resolved++;
    if ((data.votes || 0) >= 5) highPriority++;
  });

  const el = (id) => document.getElementById(id);
  if (el("total")) el("total").innerText = total;
  if (el("pending")) el("pending").innerText = pending;
  if (el("resolved")) el("resolved").innerText = resolved;
  if (el("highPriority")) el("highPriority").innerText = highPriority;
};