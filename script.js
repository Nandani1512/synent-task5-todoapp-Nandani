// ===== State =====
// Each todo: { id: Number, text: String, completed: Boolean }
let todos = [];

const STORAGE_KEY = "todos";

// ===== DOM references =====
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const footer = document.getElementById("todo-footer");
const dateEl = document.getElementById("current-date");
const greetingEl = document.getElementById("greeting");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");
const themeToggle = document.getElementById("theme-toggle");
const celebration = document.getElementById("celebration");
const celebrationClose = document.getElementById("celebration-close");

// Tracks completion state so the celebration fires only on the
// transition into 100% (not on every render or on page load).
let allDonePrev = false;
let statsReady = false;

// ===== Theme (dark / light) =====
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  // Show the icon for the theme you can switch TO.
  themeToggle.querySelector(".theme-icon").textContent =
    theme === "dark" ? "☀️" : "🌙";
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

// ===== Greeting based on time of day =====
function renderGreeting() {
  const hour = new Date().getHours();
  let text = "Good evening 🌙";
  if (hour < 12) text = "Good morning ☀️";
  else if (hour < 17) text = "Good afternoon 👋";
  greetingEl.textContent = text;
}

// ===== Show today's date (e.g. "Monday, 8 June") =====
function renderDate() {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ===== Confetti burst (fired when a task is completed) =====
function spawnConfetti(x, y) {
  const colors = ["#fb7185", "#f472b6", "#f9a8d4", "#fda4af", "#fbbf24", "#fb923c"];
  for (let i = 0; i < 26; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = x + "px";
    piece.style.top = y + "px";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--dx", (Math.random() - 0.5) * 300 + "px");
    piece.style.setProperty("--dy", (Math.random() - 0.65) * 300 + "px");
    piece.style.setProperty("--rot", Math.random() * 720 - 360 + "deg");
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1000);
  }
}

// ===== Celebration overlay (shown when everything is complete) =====
function celebrationConfetti() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const points = [
    [w * 0.2, h * 0.3],
    [w * 0.5, h * 0.22],
    [w * 0.8, h * 0.3],
  ];
  // Two staggered waves for a fuller burst.
  for (let wave = 0; wave < 2; wave++) {
    points.forEach((p, i) => {
      setTimeout(() => spawnConfetti(p[0], p[1]), wave * 350 + i * 120);
    });
  }
}

function showCelebration() {
  celebration.classList.add("show");
  celebration.setAttribute("aria-hidden", "false");
  celebrationConfetti();
}

function hideCelebration() {
  celebration.classList.remove("show");
  celebration.setAttribute("aria-hidden", "true");
}

// Dismiss on button click or by clicking the dimmed backdrop.
celebrationClose.addEventListener("click", hideCelebration);
celebration.addEventListener("click", (e) => {
  if (e.target === celebration) hideCelebration();
});

// ===== Update progress bar + footer count =====
function updateStats() {
  const total = todos.length;
  const done = todos.filter((todo) => todo.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  progressFill.style.width = percent + "%";
  progressPercent.textContent = percent + "%";

  // Celebrate when everything is complete.
  const isComplete = total > 0 && done === total;
  progressFill.classList.toggle("complete", isComplete);
  progressPercent.classList.toggle("complete", isComplete);

  // Big shout-out only on the transition into 100% (skip the first
  // render so it doesn't pop on page load when already complete).
  if (statsReady && isComplete && !allDonePrev) {
    showCelebration();
  }
  allDonePrev = isComplete;
  statsReady = true;

  if (total === 0) {
    footer.textContent = "";
  } else if (isComplete) {
    footer.innerHTML = "🎉 All done! Great job!";
  } else {
    footer.innerHTML = `<b>${done}</b> of <b>${total}</b> tasks completed`;
  }
}

// ===== Persistence =====
// Save the current todos array to localStorage.
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Load todos from localStorage on startup (empty array if none / invalid).
function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    todos = stored ? JSON.parse(stored) : [];
  } catch {
    todos = [];
  }
}

// ===== Render =====
// Rebuilds the visible list from the `todos` array.
function renderTodos() {
  list.innerHTML = "";

  // Empty state when there are no tasks.
  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.innerHTML =
      '<span class="emoji">🗒️</span>No tasks yet — add your first one above!';
    list.appendChild(empty);
    updateStats();
    return;
  }

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    // Check box indicator — toggles completion.
    const check = document.createElement("span");
    check.className = "todo-check";
    check.dataset.action = "toggle";

    // Task text — also toggles completion when clicked.
    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    text.dataset.action = "toggle";

    // Delete button.
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "×"; // × symbol
    del.dataset.action = "delete";
    del.setAttribute("aria-label", "Delete task");

    li.appendChild(check);
    li.appendChild(text);
    li.appendChild(del);
    list.appendChild(li);
  });

  // Refresh progress bar + footer count.
  updateStats();
}

// ===== Add a task =====
function addTodo(text) {
  const trimmed = text.trim();
  if (trimmed === "") return; // ignore empty / whitespace-only input

  todos.push({
    id: Date.now(),
    text: trimmed,
    completed: false,
  });

  saveTodos();
  renderTodos();
}

// ===== Toggle completed =====
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  renderTodos();
}

// ===== Delete a task =====
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// ===== Event delegation for the list =====
// One listener handles toggle + delete for every row (current and future).
list.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  const li = e.target.closest(".todo-item");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (action === "toggle") {
    // If this click will COMPLETE the task, celebrate with confetti.
    const todo = todos.find((t) => t.id === id);
    const willComplete = todo && !todo.completed;
    if (willComplete) {
      const rect = li.getBoundingClientRect();
      spawnConfetti(rect.left + 26, rect.top + rect.height / 2);
    }
    toggleTodo(id);
  } else if (action === "delete") {
    deleteTodo(id);
  }
});

// Form submit fires on both the "Add" button click and the Enter key.
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = "";
  input.focus();
});

// Initialize: theme, greeting, date, then load + render saved tasks.
initTheme();
renderGreeting();
renderDate();
loadTodos();
renderTodos();
