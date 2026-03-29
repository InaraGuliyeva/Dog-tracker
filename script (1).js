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


// Global state for logs
let logs = [];

// Listen for real-time updates from Firebase
const q = query(collection(db, "logs"), orderBy("timestamp", "asc"));
onSnapshot(q, (snapshot) => {
  logs = [];
  snapshot.forEach((doc) => {
    logs.push({ id: doc.id, ...doc.data() });
  });
  
  // Update the UI automatically whenever data changes on ANY device
  updateHome();
  if (document.getElementById("view").classList.contains("active")) {
    renderLogs();
  }
});

window.showPage = function(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  if (pageId === "view") {
    renderLogs();
  }
};

function getSelectedTask() {
  const selectedButton = document.querySelector(".task-button.selected");
  return selectedButton ? selectedButton.dataset.task : "Feeding";
}

function formatDateTimeForDisplay(dateString) {
  const dateObject = new Date(dateString);
  return dateObject.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

window.saveTask = async function() {
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
    const [hours, minutes] = chosenTime.split(":");
    now.setHours(Number(hours), Number(minutes), 0, 0);
  }

  const newTask = {
    type: taskType,
    person,
    note,
    timestamp: now.toISOString(),
  };

  try {
    // Save to Firebase instead of localStorage
    await addDoc(collection(db, "logs"), newTask);
    
    alert("Task logged!");

    document.getElementById("taskTime").value = "";
    document.getElementById("taskPerson").value = "";
    document.getElementById("taskNote").value = "";
    setSelectedTaskButton("Feeding");

    window.showPage("home");
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Failed to save task. Check console for details.");
  }
};

function updateHome() {
  const latestActivityBox = document.getElementById("latest-activity");

  if (logs.length === 0) {
    latestActivityBox.innerHTML =
      "<h2>Latest Activity</h2><p>No tasks logged yet.</p>";
    return;
  }

  const lastLog = logs[logs.length - 1];
  const activityTime = formatDateTimeForDisplay(lastLog.timestamp);

  latestActivityBox.innerHTML = `
        <h2>Latest Activity: ${lastLog.type}</h2>
        <p><strong>Time:</strong> ${activityTime}</p>
        <p><strong>By:</strong> ${lastLog.person}</p>
        ${lastLog.note ? `<p><strong>Note:</strong> ${lastLog.note}</p>` : ""}
    `;
}

function renderLogs() {
  const list = document.getElementById("logList");
  list.innerHTML = "";

  const newestFirst = [...logs].reverse();

  newestFirst.forEach((task) => {
    const card = document.createElement("div");
    card.className = "log-card";

    const formattedTime = formatDateTimeForDisplay(task.timestamp);
    const noteText = task.note ? `<br>Note: ${task.note}` : "";

    card.innerHTML = `
            <div>
                <small>${formattedTime}</small><br>
                Completed by: ${task.person}${noteText}
            </div>
            <div style="font-weight: bold;">${task.type}</div>
        `;

    list.appendChild(card);
  });
}

function setSelectedTaskButton(taskName) {
  const taskButtons = document.querySelectorAll(".task-button");
  taskButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.task === taskName);
  });
}

function setupTaskButtons() {
  const taskButtons = document.querySelectorAll(".task-button");
  taskButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedTaskButton(button.dataset.task);
    });
  });
}

setupTaskButtons();