const API = '/api';
let token = localStorage.getItem('token');

function showMessage(msg) {
  document.getElementById('message').innerText = msg;
}

function showTasks() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('tasks-section').classList.remove('hidden');
  loadTasks();
}

function showAuth() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('tasks-section').classList.add('hidden');
}

async function register() {
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  const res = await fetch(API + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    localStorage.setItem('token', token);
    // Clear form fields
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';
    showMessage(''); // Clear message
    showTasks();
  } else {
    showMessage(data.error || 'Registration failed');
  }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    localStorage.setItem('token', token);
    // Clear form fields
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    showMessage(''); // Clear message
    showTasks();
  } else {
    showMessage(data.error || 'Login failed');
  }
}

async function loadTasks() {
  const res = await fetch(API + '/tasks', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const tasks = await res.json();
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach((t) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = t.title + ' — ' + t.status;
    li.appendChild(span);
    list.appendChild(li);
  });
}

async function createTask() {
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;

  if (!title.trim()) {
    showMessage('Title is required');
    return;
  }

  const res = await fetch(API + '/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ title, description })
  });

  if (res.ok) {
    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    showMessage(''); // Clear message on success
    loadTasks();
  } else {
    const data = await res.json();
    showMessage(data.error || 'Failed to create task');
  }
}


function logout() {
  token = null;
  localStorage.removeItem('token');
  showAuth();
}

// Event listeners for buttons (CSP compliant - no inline onclick handlers)
document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('register-btn').addEventListener('click', register);
document.getElementById('create-task-btn').addEventListener('click', createTask);
document.getElementById('logout-btn').addEventListener('click', logout);

// Show tasks only if user is logged in
if (token) {
  showTasks();
} else {
  showAuth();
}
