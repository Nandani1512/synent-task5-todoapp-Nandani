// ===== State =====
// Each todo: { id: Number, text: String, completed: Boolean }
let todos = [];

// ===== DOM references =====
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

// ===== Render =====
// Rebuilds the visible list from the `todos` array.
function renderTodos() {
  list.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    // Circular check indicator — toggles completion.
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

  renderTodos();
}

// ===== Toggle completed =====
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  renderTodos();
}

// ===== Delete a task =====
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
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

// Initial render (empty for now).
renderTodos();
