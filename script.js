import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaeSCVD-JQO8_f9EbKn2IKzM__QBR8lyE",
  authDomain: "dog-tracker-7e680.firebaseapp.com",
  projectId: "dog-tracker-7e680",
  storageBucket: "dog-tracker-7e680.firebasestorage.app",
  messagingSenderId: "907594082158",
  appId: "1:907594082158:web:ae6e5dc88cbc8a0a1bc37f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let logs = [];

// ── Navigation ────────────────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
  if (pageId === "view") renderLogs();
}

document.querySelectorAll("nav [data-page]").forEach(el => {
  el.addEventListener("click", () => showPage(el.dataset.page));
});

document.getElementById("goToLogBtn").addEventListener("click", () => showPage("log"));

// ── Task type buttons ─────────────────────────────────────────────────────────
function setSelectedTask(taskName) {
  document.querySelectorAll(".task-button").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.task === taskName);
  });
}

function getSelectedTask() {
  const sel = document.querySelector(".task-button.selected");
  return sel ? sel.dataset.task : "Feeding";
}

document.querySelectorAll(".task-button").forEach(btn => {
  btn.addEventListener("click", () => setSelectedTask(btn.dataset.task));
});

// ── Save task ─────────────────────────────────────────────────────────────────
document.getElementById("saveTaskBtn").addEventListener("click", async () => {
  const taskType = getSelectedTask();
  const person = document.getElementById("taskPerson").value.trim();
  const chosenTime = document.getElementById("taskTime").value;
  const note = document.getElementById("taskNote").value.trim();

  if (!person) {
    alert("Please enter your name.");
    return;
  }

  const now = new Date();
  if (chosenTime) {
    const [h, m] = chosenTime.split(":");
    now.setHours(Number(h), Number(m), 0, 0);
  }

  try {
    await addDoc(collection(db, "logs"), {
      type: taskType, person, note, timestamp: now.toISOString()
    });
    alert("Task logged!");
    document.getElementById("taskPerson").value = "";
    document.getElementById("taskTime").value = "";
    document.getElementById("taskNote").value = "";
    setSelectedTask("Feeding");
    showPage("home");
  } catch (err) {
    console.error("Firebase write error:", err);
    alert("Could not save. Check your Firestore rules (see console).");
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(iso) {
  return new Date(iso).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function updateHome() {
  const box = document.getElementById("latest-activity");
  if (logs.length === 0) {
    box.innerHTML = "<h2>Latest Activity</h2><p>No tasks logged yet.</p>";
    return;
  }
  const last = logs[logs.length - 1];
  box.innerHTML = `
    <h2>Latest Activity: ${last.type}</h2>
    <p><strong>Time:</strong> ${fmt(last.timestamp)}</p>
    <p><strong>By:</strong> ${last.person}</p>
    ${last.note ? `<p><strong>Note:</strong> ${last.note}</p>` : ""}
  `;
}

function renderLogs() {
  const list = document.getElementById("logList");
  list.innerHTML = "";
  [...logs].reverse().forEach(task => {
    const card = document.createElement("div");
    card.className = "log-card";
    card.innerHTML = `
      <div>
        <small>${fmt(task.timestamp)}</small><br>
        Completed by: <strong>${task.person}</strong>
        ${task.note ? `<br><em>${task.note}</em>` : ""}
      </div>
      <div style="font-weight:bold;font-size:18px;">${task.type}</div>
    `;
    list.appendChild(card);
  });
}

// ── Firebase listener — error handler prevents crashing the whole script ──────
const q = query(collection(db, "logs"), orderBy("timestamp", "asc"));
onSnapshot(q, (snapshot) => {
  logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  updateHome();
  if (document.getElementById("view").classList.contains("active")) renderLogs();
}, (err) => {
  // Listener failed (e.g. Firestore rules blocking reads) — buttons still work
  console.error("Firestore read error:", err);
});
