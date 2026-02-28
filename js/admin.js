import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.loadAdminData = async () => {
  const snapshot = await getDocs(collection(db,"complaints"));
  let total=0,pending=0,resolved=0;
  snapshot.forEach(doc=>{
    total++;
    if(doc.data().status==="Pending") pending++;
    if(doc.data().status==="Resolved") resolved++;
  });
  document.getElementById("total").innerText=total;
  document.getElementById("pending").innerText=pending;
  document.getElementById("resolved").innerText=resolved;
};