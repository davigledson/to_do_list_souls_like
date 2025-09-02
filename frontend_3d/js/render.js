// render.js
// Importa as funções que fazem fetch do backend e renderiza no DOM
import { getUsers, getTodos, getTasks } from './script.js';

// Renderiza uma lista de objetos em um <ul>
export function renderList(data, elementId) {
  const ul = document.getElementById(elementId);
  if (!ul) return console.warn(`Element ${elementId} not found`);
  ul.innerHTML = ''; // limpa antes de renderizar

  if (!data || data.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nenhum item';
    ul.appendChild(li);
    return;
  }

  data.forEach(item => {
    const li = document.createElement('li');
    // Formatação mais legível: tenta exibir id + nome ou title
    const main = item.name ?? item.title ?? item.id ?? JSON.stringify(item);
    // você pode adicionar mais campos aqui se quiser
    li.textContent = `${item.id ? item.id + ' - ' : ''}${main}`;
    ul.appendChild(li);
  });
}

// Renderiza texto simples em qualquer elemento
export function renderText(text, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return console.warn(`Element ${elementId} not found`);
  el.textContent = text;
}

// Inicializa tudo: busca dados e chama renderers
export async function initFront() {
  try {
    // busca paralela
    const [users, todos, tasks] = await Promise.all([
      getUsers().catch(e => { console.error('getUsers error', e); return []; }),
      getTodos().catch(e => { console.error('getTodos error', e); return []; }),
      getTasks().catch(e => { console.error('getTasks error', e); return []; }),
    ]);

    renderList(users, 'users-list');
    renderList(todos, 'todos-list');
    renderList(tasks, 'tasks-list');

  
  } catch (err) {
    console.error('Erro initFront', err);
    renderText(`Erro ao inicializar: ${err.message}`, 'teste-text');
  }
}
