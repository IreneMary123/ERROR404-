import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  increment,
  getDoc,
  deleteField
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { isInappropriate } from "./moderation.js";

/* ============================================
   STATE
   ============================================ */
let currentUser = null;
let allComplaints = [];      // cached complaint data
let currentSort = "hot";     // hot | top | new
let currentCategory = "all"; // filtering
let searchQuery = "";        // search term

/* ============================================
   AUTH CHECK
   ============================================ */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;

  // If user is Admin, straight to admin dashboard
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && (userDoc.data().role === "Faculty" || userDoc.data().role === "Admin")) {
      window.location.href = "admin.html";
      return;
    }
  } catch (e) { /* ignore */ }

  loadComplaints();
});


/* ============================================
   TOAST
   ============================================ */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ============================================
   TIME AGO
   ============================================ */
function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 0) return "just now";
  const intervals = [
    { label: "year", short: "y", seconds: 31536000 },
    { label: "month", short: "mo", seconds: 2592000 },
    { label: "day", short: "d", seconds: 86400 },
    { label: "hour", short: "h", seconds: 3600 },
    { label: "minute", short: "m", seconds: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count}${i.short} ago`;
  }
  return "just now";
}

/* ============================================
   STATUS BADGE
   ============================================ */
function getBadgeClass(status) {
  switch (status) {
    case "Pending": return "badge--pending";
    case "In Progress": return "badge--in-progress";
    case "Resolved": return "badge--resolved";
    default: return "badge--pending";
  }
}

/* ============================================
   LOAD COMPLAINTS
   ============================================ */
async function loadComplaints() {
  try {
    const q = query(collection(db, "complaints"), orderBy("votes", "desc"));
    const snapshot = await getDocs(q);

    allComplaints = [];
    let total = 0, pending = 0, resolved = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      total++;
      if (data.status === "Pending") pending++;
      if (data.status === "Resolved") resolved++;

      allComplaints.push({
        id: docSnap.id,
        ...data,
        _createdAt: data.created_at ? data.created_at.toDate() : new Date(0)
      });
    });

    // Update sidebar stats
    const st = document.getElementById("statTotal");
    const sp = document.getElementById("statPending");
    const sr = document.getElementById("statResolved");
    if (st) st.textContent = total;
    if (sp) sp.textContent = pending;
    if (sr) sr.textContent = resolved;

    renderComplaints();
  } catch (err) {
    console.error("Error loading complaints:", err);
    showToast("❌ Failed to load complaints");
  }
}

/* ============================================
   RENDER COMPLAINTS (sorted + filtered)
   ============================================ */
function renderComplaints() {
  let list = [...allComplaints];

  // Moderation filter — hide inappropriate content
  list = list.filter(c => {
    const titleOk = !isInappropriate(c.title || "");
    const descOk = !isInappropriate(c.description || "");
    return titleOk && descOk;
  });

  // Category filter
  if (currentCategory !== "all") {
    list = list.filter(c => c.category === currentCategory);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(c =>
      (c.title || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q) ||
      (c.category || "").toLowerCase().includes(q)
    );
  }

  // Sort
  switch (currentSort) {
    case "top":
      list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      break;
    case "new":
      list.sort((a, b) => b._createdAt - a._createdAt);
      break;
    case "hot":
    default:
      // Hot = votes weighted by recency (logarithmic decay)
      list.sort((a, b) => {
        const scoreA = hotScore(a.votes || 0, a._createdAt);
        const scoreB = hotScore(b.votes || 0, b._createdAt);
        return scoreB - scoreA;
      });
      break;
  }

  const container = document.getElementById("complaintList");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📭</div>
        <div class="empty-state__text">No complaints found</div>
        <div class="empty-state__sub">${currentCategory !== "all" ? "Try a different category or " : ""}be the first to submit one!</div>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((data) => {
    const votedBy = data.votedBy || {};
    const userVote = currentUser ? votedBy[currentUser.uid] : null;
    const voteCount = data.votes || 0;

    return `
      <div class="post-card" id="post-${data.id}">
        <div class="vote-sidebar">
          <button class="vote-btn ${userVote === 'up' ? 'upvoted' : ''}" 
                  onclick="handleVote('${data.id}')" 
                  title="Boost this complaint"
                  aria-label="Boost">🔥</button>
          <span class="vote-count ${userVote === 'up' ? 'upvoted' : ''}">${voteCount}</span>
        </div>
        <div class="post-content">
          <div class="post-meta">
            <span class="post-meta__category">📂 ${data.category || "General"}</span>
            <span>•</span>
            <span>Posted by Anonymous</span>
            <span>•</span>
            <span>${timeAgo(data._createdAt)}</span>
          </div>
          <div class="post-title">${data.title || ""}</div>
          <div class="post-description">${data.description || ""}</div>
          <div class="post-actions">
            <span class="badge ${getBadgeClass(data.status)}">${data.status || "Pending"}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ============================================
   HOT SCORE Algorithm
   ============================================ */
function hotScore(votes, createdAt) {
  const ageHours = (Date.now() - createdAt.getTime()) / 3600000;
  // Reddit-like: log(votes) - age decay
  const sign = votes > 0 ? 1 : votes < 0 ? -1 : 0;
  const order = Math.log10(Math.max(Math.abs(votes), 1));
  return sign * order - (ageHours / 24);
}

/* ============================================
   UPVOTE / DOWNVOTE (toggle system)
   ============================================ */
async function handleVote(complaintId) {
  if (!currentUser) {
    showToast("⚠️ Please log in to vote");
    return;
  }

  const uid = currentUser.uid;
  const complaint = allComplaints.find(c => c.id === complaintId);
  if (!complaint) return;

  const votedBy = complaint.votedBy || {};
  const currentVote = votedBy[uid]; // "up" or undefined

  let voteChange = 0;
  let newVotedBy = { ...votedBy };

  if (currentVote === 'up') {
    // Toggle off — remove vote
    delete newVotedBy[uid];
    voteChange = -1;
  } else {
    // New vote (upvote)
    newVotedBy[uid] = 'up';
    voteChange = 1;
  }

  // Optimistic UI update
  complaint.votedBy = newVotedBy;
  complaint.votes = (complaint.votes || 0) + voteChange;

  // Animate the vote button
  const postEl = document.getElementById(`post-${complaintId}`);
  if (postEl) {
    const btn = postEl.querySelector(".vote-btn");
    if (btn) {
      btn.classList.add("animate");
      setTimeout(() => btn.classList.remove("animate"), 200);
    }
  }

  renderComplaints();

  // Firestore update
  try {
    const ref = doc(db, "complaints", complaintId);
    const updateData = {
      votes: increment(voteChange)
    };
    if (newVotedBy[uid]) {
      updateData[`votedBy.${uid}`] = newVotedBy[uid];
    } else {
      updateData[`votedBy.${uid}`] = deleteField();
    }
    await updateDoc(ref, updateData);
  } catch (err) {
    console.error("Vote error:", err);
    showToast("❌ Vote failed. Try again.");
    // Revert optimistic update
    complaint.votedBy = votedBy;
    complaint.votes = (complaint.votes || 0) - voteChange;
    renderComplaints();
  }
}

/* ============================================
   SORT BAR
   ============================================ */
document.querySelectorAll(".sort-bar__btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-bar__btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSort = btn.dataset.sort;
    renderComplaints();
  });
});

/* ============================================
   CATEGORY FILTER
   ============================================ */
const categoryContainer = document.getElementById("categoryFilter");
if (categoryContainer) {
  categoryContainer.addEventListener("click", (e) => {
    const pill = e.target.closest(".category-pill");
    if (!pill) return;

    categoryContainer.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    currentCategory = pill.dataset.category;
    renderComplaints();
  });
}

/* ============================================
   SEARCH
   ============================================ */
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      renderComplaints();
    }, 300);
  });
}

/* ============================================
   LOGOUT
   ============================================ */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

/* ============================================
   GLOBAL EXPORTS
   ============================================ */
window.handleVote = handleVote;
window.loadComplaints = loadComplaints;