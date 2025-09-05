// render.js - Sistema de renderização atualizado
import { 
  getUsers, 
  getTodos, 
  getTasks, 
  createTodo, 
  createTask,
  deleteTodo,
  deleteTask,
  completeTask,
  uncompleteTask,
  testConnection 
} from './script.js';

/**
 * Classe principal para gerenciar a interface da aplicação
 */
class AppRenderer {
  constructor() {
    this.data = {
      users: [],
      todos: [],
      tasks: []
    };
    this.isLoading = false;
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    this.showLoading('Testando conexão com a API...');
    
    try {
      const isConnected = await testConnection();
      
      if (!isConnected) {
        this.showError('Não foi possível conectar com a API');
        return;
      }

      await this.loadAllData();
      this.showSuccess('Aplicação carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar aplicação:', error);
      this.showError('Erro ao inicializar aplicação');
    }
  }

  /**
   * Carrega todos os dados da aplicação
   */
  async loadAllData() {
    this.showLoading('Carregando dados...');
    
    try {
      const [users, todos, tasks] = await Promise.allSettled([
        getUsers(),
        getTodos(),
        getTasks()
      ]);

      // Processa resultados das promises
      this.data.users = users.status === 'fulfilled' ? users.value : [];
      this.data.todos = todos.status === 'fulfilled' ? todos.value : [];
      this.data.tasks = tasks.status === 'fulfilled' ? tasks.value : [];

      // Renderiza todos os dados
      this.renderUsers();
      this.renderTodos();
      this.renderTasks();

      // Log de erros se houver
      if (users.status === 'rejected') console.error('Erro ao carregar users:', users.reason);
      if (todos.status === 'rejected') console.error('Erro ao carregar todos:', todos.reason);
      if (tasks.status === 'rejected') console.error('Erro ao carregar tasks:', tasks.reason);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showError('Erro ao carregar dados');
    }
  }

  /**
   * Renderiza a lista de usuários
   */
  renderUsers() {
    this.renderList(this.data.users, 'users-list', {
      empty: 'Nenhum usuário encontrado',
      itemRenderer: (user) => `
        <div class="item-content">
          <strong>${user.id}</strong> - ${user.name}
          ${user.email ? `<br><small>📧 ${user.email}</small>` : ''}
        </div>
      `
    });
  }

  /**
   * Renderiza a lista de todos
   */
  renderTodos() {
    this.renderList(this.data.todos, 'todos-list', {
      empty: 'Nenhum todo encontrado',
      itemRenderer: (todo) => {
        const taskCount = this.data.tasks.filter(task => task.todo_id === todo.id).length;
        return `
          <div class="item-content">
            <div class="item-header">
              <strong>${todo.id}</strong> - ${todo.title}
              ${taskCount > 0 ? `<span class="badge">${taskCount} tasks</span>` : ''}
            </div>
            ${todo.user_name ? `<div class="item-meta">👤 ${todo.user_name}</div>` : ''}
            ${todo.created_at ? `<div class="item-meta">📅 ${this.formatDate(todo.created_at)}</div>` : ''}
            <div class="item-actions">
              <button class="btn btn-sm btn-danger" onclick="renderer.deleteTodoHandler(${todo.id})">
                🗑️ Deletar
              </button>
            </div>
          </div>
        `;
      }
    });
  }

  /**
   * Renderiza a lista de tasks
   */
  renderTasks() {
    this.renderList(this.data.tasks, 'tasks-list', {
      empty: 'Nenhuma task encontrada',
      itemRenderer: (task) => {
        const todo = this.data.todos.find(t => t.id === task.todo_id);
        return `
          <div class="item-content ${task.is_completed ? 'completed' : ''}">
            <div class="item-header">
              <strong>${task.id}</strong> - ${task.title}
              ${task.is_completed ? '<span class="status-badge completed">✅</span>' : '<span class="status-badge pending">⏳</span>'}
            </div>
            ${task.description ? `<div class="item-description">${task.description}</div>` : ''}
            <div class="item-meta">
              📋 Todo: ${todo ? todo.title : task.todo_id}
            </div>
            ${task.created_at ? `<div class="item-meta">📅 ${this.formatDate(task.created_at)}</div>` : ''}
            <div class="item-actions">
              <button class="btn btn-sm ${task.is_completed ? 'btn-secondary' : 'btn-success'}" 
                      onclick="renderer.toggleTaskHandler(${task.id}, ${!task.is_completed})">
                ${task.is_completed ? '↩️ Desmarcar' : '✅ Completar'}
              </button>
              <button class="btn btn-sm btn-danger" onclick="renderer.deleteTaskHandler(${task.id})">
                🗑️ Deletar
              </button>
            </div>
          </div>
        `;
      }
    });
  }

  /**
   * Função genérica para renderizar listas
   */
  renderList(data, elementId, options = {}) {
    const ul = document.getElementById(elementId);
    if (!ul) {
      console.warn(`Elemento ${elementId} não encontrado`);
      return;
    }

    ul.innerHTML = '';

    if (!data || data.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-state';
      li.innerHTML = options.empty || 'Nenhum item encontrado';
      ul.appendChild(li);
      return;
    }

    data.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-item';
      
      if (options.itemRenderer) {
        li.innerHTML = options.itemRenderer(item);
      } else {
        // Renderização padrão
        const displayText = item.name || item.title || item.id || JSON.stringify(item);
        li.innerHTML = `<div class="item-content">${item.id ? `${item.id} - ` : ''}${displayText}</div>`;
      }
      
      ul.appendChild(li);
    });
  }

  /**
   * Mostra mensagem de loading
   */
  showLoading(message = 'Carregando...') {
    this.updateStatus(message, 'loading');
    this.isLoading = true;
  }

  /**
   * Mostra mensagem de sucesso
   */
  showSuccess(message) {
    this.updateStatus(message, 'success');
    this.isLoading = false;
  }

  /**
   * Mostra mensagem de erro
   */
  showError(message) {
    this.updateStatus(message, 'error');
    this.isLoading = false;
  }

  /**
   * Atualiza o status na interface
   */
  updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-text') || document.getElementById('teste-text');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `status-text ${type}`;
    }
  }

  /**
   * Formata data para exibição
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  // ==================== HANDLERS DE EVENTOS ====================

  /**
   * Handler para criar todo de exemplo
   */
  async createSampleTodo() {
    if (this.isLoading) return;

    try {
      this.showLoading('Criando todo...');
      
      const sampleTodo = {
        title: `Todo Exemplo ${new Date().toLocaleString('pt-BR')}`,
        user_name: 'Usuário Teste'
      };
      
      await createTodo(sampleTodo);
      await this.reloadTodos();
      this.showSuccess('Todo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar todo:', error);
      this.showError('Erro ao criar todo');
    }
  }

  /**
   * Handler para criar task de exemplo
   */
  async createSampleTask() {
    if (this.isLoading) return;

    if (!this.data.todos || this.data.todos.length === 0) {
      alert('Crie um Todo primeiro!');
      return;
    }

    try {
      this.showLoading('Criando task...');
      
      const sampleTask = {
        title: `Task Exemplo ${new Date().toLocaleString('pt-BR')}`,
        description: 'Descrição da task de exemplo',
        is_completed: false,
        todo_id: this.data.todos[0].id
      };
      
      await createTask(sampleTask);
      await this.reloadTasks();
      this.showSuccess('Task criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar task:', error);
      this.showError('Erro ao criar task');
    }
  }

  /**
   * Handler para deletar todo
   */
  async deleteTodoHandler(id) {
    if (this.isLoading) return;
    if (!confirm('Tem certeza que deseja deletar este todo?')) return;

    try {
      this.showLoading('Deletando todo...');
      await deleteTodo(id);
      await this.reloadTodos();
      await this.reloadTasks(); // Recarrega tasks também
      this.showSuccess('Todo deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar todo:', error);
      this.showError('Erro ao deletar todo');
    }
  }

  /**
   * Handler para deletar task
   */
  async deleteTaskHandler(id) {
    if (this.isLoading) return;
    if (!confirm('Tem certeza que deseja deletar esta task?')) return;

    try {
      this.showLoading('Deletando task...');
      await deleteTask(id);
      await this.reloadTasks();
      this.showSuccess('Task deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar task:', error);
      this.showError('Erro ao deletar task');
    }
  }

  /**
   * Handler para alternar status da task
   */
  async toggleTaskHandler(id, shouldComplete) {
    if (this.isLoading) return;

    try {
      this.showLoading(`${shouldComplete ? 'Completando' : 'Desmarcando'} task...`);
      
      if (shouldComplete) {
        await completeTask(id);
      } else {
        await uncompleteTask(id);
      }
      
      await this.reloadTasks();
      this.showSuccess(`Task ${shouldComplete ? 'completada' : 'desmarcada'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status da task:', error);
      this.showError('Erro ao alterar status da task');
    }
  }

  // ==================== MÉTODOS DE RECARGA ====================

  async reloadUsers() {
    try {
      this.data.users = await getUsers();
      this.renderUsers();
    } catch (error) {
      console.error('Erro ao recarregar users:', error);
    }
  }

  async reloadTodos() {
    try {
      this.data.todos = await getTodos();
      this.renderTodos();
    } catch (error) {
      console.error('Erro ao recarregar todos:', error);
    }
  }

  async reloadTasks() {
    try {
      this.data.tasks = await getTasks();
      this.renderTasks();
    } catch (error) {
      console.error('Erro ao recarregar tasks:', error);
    }
  }
}

// Instância global do renderizador
const renderer = new AppRenderer();

// Função de inicialização para compatibilidade
export async function initFront() {
  await renderer.init();
}

// Exporta o renderer para uso global
export { renderer };

// Torna disponível globalmente para uso nos event handlers
if (typeof window !== 'undefined') {
  window.renderer = renderer;
}