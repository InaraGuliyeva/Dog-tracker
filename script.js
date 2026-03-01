function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  if (pageId === "view") {
    renderLogs();
  }

  if (pageId === "home") {
    updateHome();
  }
}

function getLogs() {
  return JSON.parse(localStorage.getItem("dogLogs")) || [];
}

function saveLogs(logs) {
  localStorage.setItem("dogLogs", JSON.stringify(logs));
}

function getSelectedTask() {
  const selectedButton = document.querySelector(".task-button.selected");
  return selectedButton ? selectedButton.dataset.task : "Feeding";
}

function formatDateTimeForDisplay(dateObject) {
  return dateObject.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function saveTask() {
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

  const logs = getLogs();
  logs.push(newTask);
  saveLogs(logs);

  alert("Task logged!");

  document.getElementById("taskTime").value = "";
  document.getElementById("taskPerson").value = "";
  document.getElementById("taskNote").value = "";
  setSelectedTaskButton("Feeding");

  updateHome();
  renderLogs();
  showPage("home");
}

function updateHome() {
  const logs = getLogs();
  const latestActivityBox = document.getElementById("latest-activity");

  if (logs.length === 0) {
    latestActivityBox.innerHTML =
      "<h2>Latest Activity</h2><p>No tasks logged yet.</p>";
    return;
  }

  const lastLog = logs[logs.length - 1];
  const activityTime = formatDateTimeForDisplay(new Date(lastLog.timestamp));

  latestActivityBox.innerHTML = `
        <h2>Latest Activity: ${lastLog.type}</h2>
        <p><strong>Time:</strong> ${activityTime}</p>
        <p><strong>By:</strong> ${lastLog.person}</p>
        ${lastLog.note ? `<p><strong>Note:</strong> ${lastLog.note}</p>` : ""}
    `;
}

function renderLogs() {
  const logs = getLogs();
  const list = document.getElementById("logList");
  list.innerHTML = "";

  const newestFirst = [...logs].reverse();

  newestFirst.forEach((task) => {
    const card = document.createElement("div");
    card.className = "log-card";

    const formattedTime = formatDateTimeForDisplay(new Date(task.timestamp));
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

window.addEventListener("storage", (event) => {
  if (event.key === "dogLogs") {
    updateHome();
    renderLogs();
  }
});

setupTaskButtons();
updateHome();
renderLogs();