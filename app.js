const DB_URL =
  'https://<project-id>-default-rtdb.europe-west1.firebasedatabase.app/todos.json';


const form   = document.getElementById('todo-form');
const input  = document.getElementById('todo-input');
const list   = document.getElementById('todo-list');
const loading= document.getElementById('loading');
const error  = document.getElementById('error');


let todos = {};


const show = (el) => el.hidden = false;
const hide = (el) => el.hidden = true;


async function loadTodos() {
  try {
    show(loading); hide(error);
    const res = await fetch(DB_URL);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    todos = data || {};
    render();
  } catch (e) {
    console.error(e);
    show(error);
  } finally {
    hide(loading);
  }
}


async function addTodo(text) {
  const newTodo = { text, done: false };
  const res = await fetch(DB_URL, {
    method : 'POST',
    body   : JSON.stringify(newTodo),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json(); 
  todos[data.name] = newTodo;
  render();
}


async function deleteTodo(fbId) {
  const delUrl = DB_URL.replace('.json', `/${fbId}.json`);
  await fetch(delUrl, { method: 'DELETE' });
  delete todos[fbId];
  render();
}


async function toggleTodo(fbId) {
  const updUrl = DB_URL.replace('.json', `/${fbId}.json`);
  const newDone = !todos[fbId].done;
  await fetch(updUrl, {
    method : 'PATCH',
    body   : JSON.stringify({ done: newDone }),
    headers: { 'Content-Type': 'application/json' }
  });
  todos[fbId].done = newDone;
  render();
}

function render() {
  list.innerHTML = '';
  Object.entries(todos).forEach(([id, {text, done}]) => {
    const li = document.createElement('li');
    li.className = done ? 'done' : '';
    li.innerHTML = `
      <span>${text}</span>
      <input type="checkbox" ${done ? 'checked' : ''}>
      <button data-del="${id}">✖</button>
    `;
    li.querySelector('input').onchange = () => toggleTodo(id);
    li.querySelector('button').onclick  = () => deleteTodo(id);
    list.appendChild(li);
  });
}


form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
});

loadTodos();