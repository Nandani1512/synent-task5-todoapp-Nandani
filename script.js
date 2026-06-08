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
    li.className = "todo-item";
    li.dataset.id = todo.id;

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    li.appendChild(text);
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

// Form submit fires on both the "Add" button click and the Enter key.
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = "";
  input.focus();
});

// Initial render (empty for now).
renderTodos();
