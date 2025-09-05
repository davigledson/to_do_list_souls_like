// services/TodoService.js
import BaseService from './BaseService.js';

class TodoService extends BaseService {
  static fetchInstance = this.createFetchInstance('todos');

  /**
   * Lista todos os todos
   * @returns {Promise<Array>} Lista de todos
   */
  static async listarTodos() {
    try {
      const response = await this.fetchInstance.get('/');
      return response;
    } catch (error) {
      this.handleError(error, 'Erro ao listar todos');
      throw error;
    }
  }

  /**
   * Busca um todo por ID
   * @param {number} id - ID do todo
   * @returns {Promise<Object>} Todo encontrado
   */
  static async buscarPorId(id) {
    try {
      const response = await this.fetchInstance.get(`/${id}`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao buscar todo ${id}`);
      throw error;
    }
  }

  /**
   * Cria um novo todo
   * @param {Object} todo - Dados do todo
   * @param {string} todo.title - Título do todo
   * @param {string} [todo.user_name] - Nome do usuário
   * @returns {Promise<Object>} Todo criado
   */
  static async criar(todo) {
    console.log('TodoService.criar - Dados recebidos:', todo);
    
    try {
      const response = await this.fetchInstance.post('/', todo);
      console.log('TodoService.criar - Todo criado:', response);
      return response;
    } catch (error) {
      this.handleError(error, 'Erro ao criar todo');
      throw error;
    }
  }

  /**
   * Atualiza um todo
   * @param {number} id - ID do todo
   * @param {Object} todo - Dados parciais do todo para atualizar
   * @returns {Promise<Object>} Todo atualizado
   */
  static async atualizar(id, todo) {
    console.log('TodoService.atualizar - Dados recebidos:', { id, todo });
    
    try {
      const response = await this.fetchInstance.put(`/${id}`, todo);
      console.log('TodoService.atualizar - Todo atualizado:', response);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar todo ${id}`);
      throw error;
    }
  }

  /**
   * Deleta um todo
   * @param {number} id - ID do todo
   * @returns {Promise<void>}
   */
  static async deletar(id) {
    console.log('TodoService.deletar - ID:', id);
    
    try {
      await this.fetchInstance.delete(`/${id}`);
      console.log('TodoService.deletar - Todo deletado com sucesso');
    } catch (error) {
      this.handleError(error, `Erro ao deletar todo ${id}`);
      throw error;
    }
  }

  /**
   * Busca todos com suas tasks
   * @param {number} id - ID do todo
   * @returns {Promise<Object>} Todo com tasks incluídas
   */
  static async buscarComTasks(id) {
    try {
      const response = await this.fetchInstance.get(`/${id}?include_tasks=true`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao buscar todo ${id} com tasks`);
      throw error;
    }
  }

  /**
   * Lista todos de um usuário específico
   * @param {string} userName - Nome do usuário
   * @returns {Promise<Array>} Lista de todos do usuário
   */
  static async listarPorUsuario(userName) {
    try {
      const response = await this.fetchInstance.get(`?user_name=${encodeURIComponent(userName)}`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao listar todos do usuário ${userName}`);
      throw error;
    }
  }
}

export default TodoService;