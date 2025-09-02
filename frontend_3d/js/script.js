// script.js
// Responsável pelas chamadas à API (fetch). Exporta funções usadas pelo render.js

const API_BASE = 'http://127.0.0.1:8000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}/${endpoint}`;
  const res = await fetch(url, options);

  // caso no content (204)
  if (res.status === 204) return null;

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

// Read
export async function getUsers() {
  return request('users');
}
export async function getTodos() {
  return request('todos');
}
export async function getTasks() {
  return request('tasks');
}

// Create (POST)
export async function create(endpoint, data) {
  return request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// Update (PUT)
export async function update(endpoint, id, data) {
  return request(`${endpoint}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// Delete
export async function remove(endpoint, id) {
  return request(`${endpoint}/${id}`, {
    method: 'DELETE',
  });
}

